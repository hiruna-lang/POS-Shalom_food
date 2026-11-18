import { getPortions } from '../utils/portions';
import { calculateBill } from '../utils/billing';
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Category,
  MenuItem,
  Table,
  Order,
  CartItem,
  OrderType,
  OrderStatus,
  PaymentMethod,
  InventoryItem,
  StockTransaction,
  User,
  AppSettings,
  GeneralSettings,
  PrinterConfig,
  CashDrawerSettings,
  KitchenRoutingSettings,
  BackupSettings,
  NetworkSettings,
  AppNotification,
  KitchenTarget,
  HeldOrder
} from '../types/pos';
import {
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_TABLES,
  INITIAL_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_STOCK_TRANSACTIONS,
  INITIAL_USERS,
  INITIAL_SETTINGS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';

interface PosContextType {
  // Current user & authentication
  isAuthenticated: boolean;
  login: (pin: string) => { success: boolean; user?: User; message?: string };
  logout: () => void;
  currentUser: User;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;

  // Categories & Menu
  categories: Category[];
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (cat: Category) => void;
  deleteCategory: (catId: string) => void;
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (itemId: string) => void;
  toggleHideMenuItem: (itemId: string) => void;
  toggleAvailability: (itemId: string) => void;

  // POS Cart & Order taking
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  selectedTable: Table | null;
  setSelectedTable: (table: Table | null) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  deliveryAddress: string;
  setDeliveryAddress: (address: string) => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  discount: number;
  setDiscount: (val: number) => void;
  discountType: 'percentage' | 'fixed';
  setDiscountType: (type: 'percentage' | 'fixed') => void;
  cart: CartItem[];
  addToCart: (item: MenuItem, qty?: number, notes?: string, portion?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  updateItemNotes: (itemId: string, notes: string) => void;
  replaceCartLine: (lineId: string, item: MenuItem, quantity: number, notes: string, portion?: string) => void;
  clearCart: () => void;

  // Cart Calculations
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  serviceChargeAmount: number;
  grandTotal: number;

  // Orders
  orders: Order[];
  createOrder: (paymentMethod?: PaymentMethod, amountPaid?: number, sendToKitchen?: boolean) => Order;
  pendingPaymentOrder: Order | null;
  completePendingPayment: (method: PaymentMethod, amountPaid: number) => Order | null;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  advanceKitchenStation: (orderId: string, station: KitchenTarget) => void;
  updatePaymentStatus: (orderId: string, method: PaymentMethod, amountPaid: number) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  recallOrderToCart: (order: Order) => void;

  // Held Orders
  heldOrders: HeldOrder[];
  holdCurrentOrder: (label?: string) => void;
  recallHeldOrder: (heldId: string) => void;
  deleteHeldOrder: (heldId: string) => void;

  // Tables
  tables: Table[];
  updateTableStatus: (tableId: string, status: 'available' | 'occupied' | 'reserved', orderId?: string, customer?: string) => void;

  // Inventory
  inventory: InventoryItem[];
  stockTransactions: StockTransaction[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastRestocked'>) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (itemId: string) => void;
  stockIn: (itemId: string, qty: number, reason: string, refNo?: string) => void;
  stockOut: (itemId: string, qty: number, reason: string) => void;
  adjustStock: (itemId: string, newStock: number, reason: string) => void;

  // Settings
  settings: AppSettings;
  updateGeneralSettings: (data: Partial<GeneralSettings>) => void;
  updatePrinterConfig: (printerKey: 'customerBill' | 'kitchen1' | 'kitchen2', data: Partial<PrinterConfig>) => void;
  updateCashDrawerSettings: (data: Partial<CashDrawerSettings>) => void;
  updateKitchenRouting: (routing: KitchenRoutingSettings) => void;
  updateBackupSettings: (data: Partial<BackupSettings>) => void;
  updateNetworkSettings: (data: Partial<NetworkSettings>) => void;
  triggerManualBackup: () => void;
  testPrinter: (printerName: string) => Promise<boolean>;
  testCashDrawer: () => Promise<boolean>;

  // Notifications & Time
  notifications: AppNotification[];
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  currentTime: Date;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

function newId() {
  return Array.from(crypto.getRandomValues(new Uint32Array(4)), (value) => value.toString(16).padStart(8, '0')).join('');
}

function readTerminalState<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(`shalom-pos-v1:${key}`);
    return stored === null ? fallback : JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

function writeTerminalState<T>(key: string, value: T) {
  try { localStorage.setItem(`shalom-pos-v1:${key}`, JSON.stringify(value)); }
  catch { /* Keep the terminal usable when browser storage is unavailable. */ }
}

function useTerminalState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readTerminalState(key, fallback));
  useEffect(() => writeTerminalState(key, value), [key, value]);
  return [value, setValue] as const;
}

export const PosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clock state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Users state
  const [users, setUsers] = useTerminalState<User[]>('staff', INITIAL_USERS);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('pos_is_authenticated') === 'true' &&
      users.some((user) => user.id === sessionStorage.getItem('pos_current_user_id') && user.status === 'active');
  });
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedId = sessionStorage.getItem('pos_current_user_id');
    if (savedId) {
      const found = users.find((u) => u.id === savedId);
      if (found) return found;
    }
    return INITIAL_USERS[0];
  });

  // Categories & Menu
  const [categories, setCategories] = useTerminalState<Category[]>('categories', INITIAL_CATEGORIES);
  const [menuItems, setMenuItems] = useTerminalState<MenuItem[]>('menu', INITIAL_MENU_ITEMS);

  // Tables & Orders
  const [tables, setTables] = useTerminalState<Table[]>('tables', INITIAL_TABLES);
  const [orders, setOrders] = useTerminalState<Order[]>('orders', INITIAL_ORDERS);
  const [pendingPaymentOrder, setPendingPaymentOrder] = useTerminalState<Order | null>('pending-payment', null);

  // Read the draft once so its table, pricing mode and cart are restored together.
  const [draft] = useState(() => readTerminalState<Omit<HeldOrder, 'id' | 'label' | 'timestamp' | 'subtotal'>>('draft', {
    orderType: 'dine_in',
    table: INITIAL_TABLES[1],
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    orderNotes: '',
    discount: 0,
    discountType: 'percentage',
    cart: [
      { menuItem: INITIAL_MENU_ITEMS[0], quantity: 1, notes: 'Less spicy' },
      { menuItem: INITIAL_MENU_ITEMS[8], quantity: 2 },
    ],
  }));
  const [orderType, setOrderType] = useState(draft.orderType);
  const [selectedTable, setSelectedTable] = useState(draft.table);
  const [customerName, setCustomerName] = useState(draft.customerName);
  const [customerPhone, setCustomerPhone] = useState(draft.customerPhone);
  const [deliveryAddress, setDeliveryAddress] = useState(draft.deliveryAddress);
  const [orderNotes, setOrderNotes] = useState(draft.orderNotes);
  const [discount, setDiscount] = useState(draft.discount);
  const [discountType, setDiscountType] = useState(draft.discountType);
  const [cart, setCart] = useState(draft.cart);
  useEffect(() => {
    writeTerminalState('draft', { orderType, table: selectedTable, customerName, customerPhone,
      deliveryAddress, orderNotes, discount, discountType, cart });
  }, [orderType, selectedTable, customerName, customerPhone, deliveryAddress, orderNotes, discount, discountType, cart]);
  const [heldOrders, setHeldOrders] = useTerminalState<HeldOrder[]>('held-orders', []);

  // Inventory & transactions
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>(INITIAL_STOCK_TRANSACTIONS);

  // Settings & Notifications
  const [settings, setSettings] = useTerminalState<AppSettings>('settings', INITIAL_SETTINGS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Helper notification adder
  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Cart lines remain independent when their portion or kitchen instructions differ.
  const configuredLine = (item: MenuItem, quantity: number, notes?: string, portion?: string): CartItem | null => {
    const product = menuItems.find((product) => product.id === item.id);
    const variant = product && getPortions(product).find((option) => option.name === portion);
    if (!product?.isAvailable || !Number.isSafeInteger(quantity) || quantity < 1 ||
        !variant) return null;
    return {
      lineId: newId(),
      menuItem: { ...product, price: variant.price },
      quantity,
      portion: variant.name,
      notes: notes?.trim() || undefined,
    };
  };

  const addToCart = (item: MenuItem, quantity = 1, notes?: string, portion?: string) => {
    const line = configuredLine(item, quantity, notes, portion);
    if (!line) return;
    setCart((previous) => {
      const match = previous.findIndex((entry) => entry.menuItem.id === item.id &&
        entry.portion === line.portion && entry.notes === line.notes && entry.menuItem.price === line.menuItem.price);
      if (match < 0) return [...previous, line];
      return previous.map((entry, index) => index === match ? { ...entry, quantity: entry.quantity + quantity } : entry);
    });
  };

  const replaceCartLine = (lineId: string, item: MenuItem, quantity: number, notes: string, portion?: string) => {
    const replacement = configuredLine(item, quantity, notes, portion);
    if (!replacement) return;
    setCart((previous) => previous.map((entry) =>
      (entry.lineId ?? entry.menuItem.id) === lineId ? { ...replacement, lineId } : entry));
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => (c.lineId ?? c.menuItem.id) !== itemId));
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((c) => {
          if ((c.lineId ?? c.menuItem.id) === itemId) {
            const newQty = c.quantity + delta;
            return newQty > 0 ? { ...c, quantity: newQty } : null;
          }
          return c;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const updateItemNotes = (itemId: string, notes: string) => {
    setCart((prev) =>
      prev.map((c) => ((c.lineId ?? c.menuItem.id) === itemId ? { ...c, notes } : c))
    );
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setOrderNotes('');
  };

  const { subtotal, discountAmount, taxAmount, serviceChargeAmount, grandTotal } = calculateBill(
    cart.map((item) => ({ price: item.menuItem.price, quantity: item.quantity })),
    currentUser.role === 'cashier' ? 0 : discount,
    discountType,
    settings.general.taxRate,
    orderType === 'dine_in' ? settings.general.serviceChargeRate : 0,
  );

  // Order creation
  const createOrder = (
    paymentMethod?: PaymentMethod,
    amountPaid?: number,
    sendToKitchen = true
  ): Order => {
    const orderNum = `ORD-${1000 + orders.length + 1}`;
    const now = new Date().toISOString();

    const changeDue = amountPaid && amountPaid >= grandTotal ? (Math.round(amountPaid * 100) - Math.round(grandTotal * 100)) / 100 : 0;

    // Determine kitchen routing for items
    let hasKitchen1 = false;
    let hasKitchen2 = false;
    cart.forEach((c) => {
      const routing = settings.kitchenRouting[c.menuItem.categoryId] || c.menuItem.kitchen;
      if (routing === 'kitchen_1') hasKitchen1 = true;
      if (routing === 'kitchen_2') hasKitchen2 = true;
    });

    const newOrder: Order = {
      id: `ord-${newId()}`,
      orderNumber: orderNum,
      type: orderType,
      tableId: orderType === 'dine_in' ? selectedTable?.id : undefined,
      tableName: orderType === 'dine_in' && selectedTable ? `${selectedTable.number} (${selectedTable.section.toUpperCase()})` : undefined,
      customerName: customerName || (orderType === 'dine_in' ? (selectedTable ? `Table ${selectedTable.number}` : 'Guest') : 'Counter Guest'),
      customerPhone: customerPhone || undefined,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      items: cart.map((line) => ({ ...line, kitchenTarget: settings.kitchenRouting[line.menuItem.categoryId] || line.menuItem.kitchen })),
      subtotal,
      discount: discountAmount,
      discountType,
      tax: taxAmount,
      serviceCharge: serviceChargeAmount,
      total: grandTotal,
      paymentMethod,
      paymentStatus: paymentMethod ? 'paid' : 'pending',
      amountPaid: amountPaid ?? (paymentMethod ? grandTotal : undefined),
      changeDue: paymentMethod ? changeDue : undefined,
      orderStatus: sendToKitchen ? 'in_kitchen' : paymentMethod ? 'completed' : 'pending',
      kitchenStatus: {
        kitchen1: hasKitchen1 ? 'sent' : 'na',
        kitchen2: hasKitchen2 ? 'sent' : 'na',
      },
      createdAt: now,
      completedAt: paymentMethod && !sendToKitchen ? now : undefined,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      notes: orderNotes || undefined,
    };

    setOrders((prev) => [newOrder, ...prev]);
    if (!paymentMethod && sendToKitchen) {
      setPendingPaymentOrder(newOrder);
    } else if (paymentMethod) {
      setPendingPaymentOrder(null);
    }

    // If table assigned, mark table as occupied
    if (orderType === 'dine_in' && selectedTable) {
      updateTableStatus(selectedTable.id, paymentMethod && !sendToKitchen ? 'available' : 'occupied', newOrder.id, newOrder.customerName);
    }

    addNotification({
      title: `Order ${orderNum} Created`,
      message: `${orderType.replace('_', ' ').toUpperCase()} order for ${newOrder.customerName} - Rs. ${grandTotal.toLocaleString()}`,
      type: 'success',
    });

    // Clear cart after successful order creation
    clearCart();
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');

    return newOrder;
  };

  const completePendingPayment = (method: PaymentMethod, amountPaid: number) => {
    if (!pendingPaymentOrder) return null;

    const changeDue = amountPaid >= pendingPaymentOrder.total
      ? (Math.round(amountPaid * 100) - Math.round(pendingPaymentOrder.total * 100)) / 100
      : 0;
    const liveOrder = orders.find((order) => order.id === pendingPaymentOrder.id);
    if (!liveOrder || liveOrder.paymentStatus === 'paid' || liveOrder.orderStatus === 'cancelled') return null;
    const updatedOrder: Order = {
      ...liveOrder,
      paymentMethod: method,
      paymentStatus: 'paid',
      amountPaid,
      changeDue,
    };

    setOrders((prev) => prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)));
    setPendingPaymentOrder(null);
    addNotification({
      title: 'Payment Successful',
      message: `${updatedOrder.orderNumber} paid via ${method.toUpperCase()} for Rs. ${updatedOrder.total.toLocaleString()}.`,
      type: 'success',
    });
    return updatedOrder;
  };

  const advanceKitchenStation = (orderId: string, station: KitchenTarget) => {
    const key = station === 'kitchen_1' ? 'kitchen1' : 'kitchen2';
    setOrders((previous) => previous.map((order) => {
      const current = order.kitchenStatus[key];
      if (order.id !== orderId || !['pending', 'in_kitchen'].includes(order.orderStatus) ||
          (current !== 'sent' && current !== 'preparing')) return order;
      const kitchenStatus = { ...order.kitchenStatus, [key]: current === 'sent' ? 'preparing' : 'ready' } as Order['kitchenStatus'];
      const allReady = Object.values(kitchenStatus).every((status) => status === 'na' || status === 'ready');
      return { ...order, kitchenStatus, orderStatus: allReady ? 'ready' : 'in_kitchen' };
    }));
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          if ((status === 'ready' || status === 'completed') && Object.values(ord.kitchenStatus).some((stage) => stage === 'sent' || stage === 'preparing')) return ord;
          const isDone = status === 'completed';
          const updated: Order = {
            ...ord,
            orderStatus: status,
            completedAt: isDone ? new Date().toISOString() : ord.completedAt,
          };
          if (status === 'completed' && ord.tableId) {
            updateTableStatus(ord.tableId, 'available');
          }
          return updated;
        }
        return ord;
      })
    );
  };

  const updatePaymentStatus = (orderId: string, method: PaymentMethod, amountPaid: number) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const change = amountPaid >= ord.total ? (Math.round(amountPaid * 100) - Math.round(ord.total * 100)) / 100 : 0;
          return {
            ...ord,
            paymentMethod: method,
            paymentStatus: 'paid',
            amountPaid,
            changeDue: change,
            orderStatus: ord.orderStatus === 'pending' ? 'in_kitchen' : ord.orderStatus,
          };
        }
        return ord;
      })
    );
    addNotification({
      title: 'Payment Successful',
      message: `Order updated with ${method.toUpperCase()} payment of Rs. ${amountPaid.toLocaleString()}`,
      type: 'success',
    });
  };

  const cancelOrder = (orderId: string, reason?: string) => {
    const target = orders.find((order) => order.id === orderId);
    if (!target || target.orderStatus === 'cancelled' || (target.paymentStatus === 'paid' && currentUser.role === 'cashier')) return;
    if (pendingPaymentOrder?.id === orderId) setPendingPaymentOrder(null);
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          if (ord.tableId) {
            updateTableStatus(ord.tableId, 'available');
          }
          return {
            ...ord,
            orderStatus: 'cancelled',
            notes: reason ? `${ord.notes ? ord.notes + ' | ' : ''}Cancelled: ${reason}` : ord.notes,
          };
        }
        return ord;
      })
    );
    addNotification({
      title: 'Order Cancelled',
      message: `Order #${orderId} was cancelled.`,
      type: 'warning',
    });
  };

  const recallOrderToCart = (order: Order) => {
    setCart([...order.items]);
    setOrderType(order.type);
    if (order.tableId) {
      const tbl = tables.find((t) => t.id === order.tableId) || null;
      setSelectedTable(tbl);
    }
    setCustomerName(order.customerName || '');
    setCustomerPhone(order.customerPhone || '');
    setDeliveryAddress(order.deliveryAddress || '');
    setOrderNotes(order.notes || '');
    addNotification({
      title: 'Order Loaded',
      message: `Loaded ${order.orderNumber} back into POS cart.`,
      type: 'info',
    });
  };

  // Held Orders management
  const holdCurrentOrder = (label?: string) => {
    if (cart.length === 0) return;
    const defaultLabel =
      orderType === 'dine_in' && selectedTable
        ? `Table ${selectedTable.number}`
        : customerName || `Ticket #${heldOrders.length + 1}`;

    const newHeld: HeldOrder = {
      id: `held-${newId()}`,
      label: label || defaultLabel,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cart: [...cart],
      orderType,
      table: selectedTable,
      customerName,
      customerPhone,
      deliveryAddress,
      orderNotes,
      discount,
      discountType,
      subtotal,
    };

    setHeldOrders((prev) => [newHeld, ...prev]);
    clearCart();
    addNotification({
      title: 'Order Put on Hold',
      message: `${newHeld.label} saved in held queue.`,
      type: 'info',
    });
  };

  const recallHeldOrder = (heldId: string) => {
    const held = heldOrders.find((h) => h.id === heldId);
    if (!held) return;
    setCart([...held.cart]);
    setOrderType(held.orderType);
    setSelectedTable(held.table);
    setCustomerName(held.customerName);
    setCustomerPhone(held.customerPhone);
    setDeliveryAddress(held.deliveryAddress);
    setOrderNotes(held.orderNotes);
    setDiscount(held.discount);
    setDiscountType(held.discountType);
    setHeldOrders((prev) => prev.filter((h) => h.id !== heldId));
    addNotification({
      title: 'Order Recalled',
      message: `Restored ${held.label} back into cart.`,
      type: 'success',
    });
  };

  const deleteHeldOrder = (heldId: string) => {
    setHeldOrders((prev) => prev.filter((h) => h.id !== heldId));
  };

  // Table management
  const updateTableStatus = (
    tableId: string,
    status: 'available' | 'occupied' | 'reserved',
    orderId?: string,
    customer?: string
  ) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          return {
            ...t,
            status,
            currentOrderId: status === 'available' ? undefined : orderId || t.currentOrderId,
            customerName: status === 'available' ? undefined : customer || t.customerName,
          };
        }
        return t;
      })
    );
  };

  // Menu items CRUD
  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `item-${Date.now()}`,
    };
    setMenuItems((prev) => [newItem, ...prev]);
    addNotification({
      title: 'Menu Item Created',
      message: `${newItem.name} added to menu.`,
      type: 'success',
    });
  };

  const updateMenuItem = (item: MenuItem) => {
    setMenuItems((prev) => prev.map((m) => (m.id === item.id ? item : m)));
    addNotification({
      title: 'Menu Item Updated',
      message: `${item.name} changes saved.`,
      type: 'success',
    });
  };

  const deleteMenuItem = (itemId: string) => {
    const target = menuItems.find((m) => m.id === itemId);
    setMenuItems((prev) => prev.filter((m) => m.id !== itemId));
    addNotification({
      title: 'Menu Item Deleted',
      message: `${target?.name || 'Item'} permanently removed from menu.`,
      type: 'warning',
    });
  };

  const toggleHideMenuItem = (itemId: string) => {
    setMenuItems((prev) =>
      prev.map((m) => {
        if (m.id === itemId) {
          const updated = { ...m, isHidden: !m.isHidden };
          addNotification({
            title: updated.isHidden ? 'Item Hidden' : 'Item Visible',
            message: `${m.name} is now ${updated.isHidden ? 'hidden from customer menu' : 'visible on menu'}.`,
            type: 'info',
          });
          return updated;
        }
        return m;
      })
    );
  };

  const toggleAvailability = (itemId: string) => {
    setMenuItems((prev) =>
      prev.map((m) => {
        if (m.id === itemId) {
          const updated = { ...m, isAvailable: !m.isAvailable };
          addNotification({
            title: updated.isAvailable ? 'Item Available' : 'Item Marked Unavailable',
            message: `${m.name} is marked as ${updated.isAvailable ? 'In Stock' : 'Out of Stock'}.`,
            type: updated.isAvailable ? 'success' : 'warning',
          });
          return updated;
        }
        return m;
      })
    );
  };

  // Categories CRUD
  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    addNotification({
      title: 'Category Created',
      message: `Category "${newCat.name}" added.`,
      type: 'success',
    });
  };

  const updateCategory = (cat: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
    addNotification({
      title: 'Category Updated',
      message: `Category "${cat.name}" updated.`,
      type: 'success',
    });
  };

  const deleteCategory = (catId: string) => {
    const target = categories.find((c) => c.id === catId);
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    addNotification({
      title: 'Category Deleted',
      message: `Category "${target?.name || ''}" removed.`,
      type: 'warning',
    });
  };

  // Inventory CRUD & Stock movements
  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'lastRestocked'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
      lastRestocked: new Date().toISOString().split('T')[0],
    };
    setInventory((prev) => [newItem, ...prev]);
    addNotification({
      title: 'Inventory Item Added',
      message: `${newItem.name} added to stock tracking.`,
      type: 'success',
    });
  };

  const updateInventoryItem = (item: InventoryItem) => {
    setInventory((prev) => prev.map((i) => (i.id === item.id ? item : i)));
    addNotification({
      title: 'Inventory Updated',
      message: `${item.name} details saved.`,
      type: 'success',
    });
  };

  const deleteInventoryItem = (itemId: string) => {
    const target = inventory.find((i) => i.id === itemId);
    setInventory((prev) => prev.filter((i) => i.id !== itemId));
    addNotification({
      title: 'Item Deleted',
      message: `${target?.name || 'Item'} removed from inventory.`,
      type: 'warning',
    });
  };

  const stockIn = (itemId: string, qty: number, reason: string, refNo?: string) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQty = item.currentStock + qty;
          const tx: StockTransaction = {
            id: `stk-${Date.now()}`,
            itemId: item.id,
            itemName: item.name,
            type: 'stock_in',
            quantity: qty,
            previousStock: item.currentStock,
            newStock: newQty,
            reason,
            referenceNumber: refNo || `GRN-${Date.now().toString().slice(-4)}`,
            date: new Date().toISOString().replace('T', ' ').slice(0, 16),
            performedBy: currentUser.name,
          };
          setStockTransactions((txs) => [tx, ...txs]);
          return {
            ...item,
            currentStock: newQty,
            lastRestocked: new Date().toISOString().split('T')[0],
          };
        }
        return item;
      })
    );
    addNotification({
      title: 'Stock Added (Stock In)',
      message: `Added +${qty} to inventory.`,
      type: 'success',
    });
  };

  const stockOut = (itemId: string, qty: number, reason: string) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQty = Math.max(0, item.currentStock - qty);
          const tx: StockTransaction = {
            id: `stk-${Date.now()}`,
            itemId: item.id,
            itemName: item.name,
            type: 'stock_out',
            quantity: qty,
            previousStock: item.currentStock,
            newStock: newQty,
            reason,
            date: new Date().toISOString().replace('T', ' ').slice(0, 16),
            performedBy: currentUser.name,
          };
          setStockTransactions((txs) => [tx, ...txs]);
          return { ...item, currentStock: newQty };
        }
        return item;
      })
    );
    addNotification({
      title: 'Stock Deducted (Stock Out)',
      message: `Deducted -${qty} from inventory.`,
      type: 'info',
    });
  };

  const adjustStock = (itemId: string, newStock: number, reason: string) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const diff = newStock - item.currentStock;
          const tx: StockTransaction = {
            id: `stk-${Date.now()}`,
            itemId: item.id,
            itemName: item.name,
            type: 'adjustment',
            quantity: Math.abs(diff),
            previousStock: item.currentStock,
            newStock,
            reason: `Audit Adjustment: ${reason}`,
            date: new Date().toISOString().replace('T', ' ').slice(0, 16),
            performedBy: currentUser.name,
          };
          setStockTransactions((txs) => [tx, ...txs]);
          return { ...item, currentStock: newStock };
        }
        return item;
      })
    );
    addNotification({
      title: 'Stock Adjusted',
      message: `Stock level manually adjusted to ${newStock}.`,
      type: 'info',
    });
  };

  // Users CRUD
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
    };
    setUsers((prev) => [...prev, newUser]);
    addNotification({
      title: 'User Created',
      message: `${newUser.name} registered as ${newUser.role.toUpperCase()}.`,
      type: 'success',
    });
  };

  const updateUser = (userData: User) => {
    setUsers((prev) => prev.map((u) => (u.id === userData.id ? userData : u)));
    if (currentUser.id === userData.id) {
      setCurrentUser(userData);
    }
    addNotification({
      title: 'User Updated',
      message: `${userData.name} profile saved.`,
      type: 'success',
    });
  };

  const deleteUser = (userId: string) => {
    if (userId === currentUser.id) {
      addNotification({
        title: 'Action Denied',
        message: 'Cannot delete currently active logged in user.',
        type: 'error',
      });
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    addNotification({
      title: 'User Removed',
      message: 'Account deleted from POS system.',
      type: 'warning',
    });
  };

  const login = (pin: string): { success: boolean; user?: User; message?: string } => {
    const matchedUser = users.find((u) => u.pin === pin && u.status === 'active');
    if (matchedUser) {
      setCurrentUser(matchedUser);
      setIsAuthenticated(true);
      sessionStorage.setItem('pos_is_authenticated', 'true');
      sessionStorage.setItem('pos_current_user_id', matchedUser.id);
      addNotification({
        title: 'User Signed In',
        message: `Welcome, ${matchedUser.name}! Terminal unlocked.`,
        type: 'success',
      });
      return { success: true, user: matchedUser };
    }

    return {
      success: false,
      message: 'Invalid PIN. Try again.',
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('pos_is_authenticated');
    sessionStorage.removeItem('pos_current_user_id');
    addNotification({
      title: 'Terminal Locked',
      message: 'Cashier signed out. Please enter PIN to access POS.',
      type: 'info',
    });
  };

  // Settings updates
  const updateGeneralSettings = (data: Partial<GeneralSettings>) => {
    setSettings((prev) => ({
      ...prev,
      general: { ...prev.general, ...data },
    }));
    addNotification({
      title: 'General Settings Saved',
      message: 'Restaurant configuration updated.',
      type: 'success',
    });
  };

  const updatePrinterConfig = (
    printerKey: 'customerBill' | 'kitchen1' | 'kitchen2',
    data: Partial<PrinterConfig>
  ) => {
    setSettings((prev) => {
      const printerName = data.name || prev.printers[printerKey].name;
      addNotification({
        title: 'Printer Configuration Saved',
        message: `${printerName} updated.`,
        type: 'success',
      });
      return {
        ...prev,
        printers: {
          ...prev.printers,
          [printerKey]: { ...prev.printers[printerKey], ...data },
        },
      };
    });
  };

  const updateCashDrawerSettings = (data: Partial<CashDrawerSettings>) => {
    setSettings((prev) => ({
      ...prev,
      cashDrawer: { ...prev.cashDrawer, ...data },
    }));
    addNotification({
      title: 'Cash Drawer Config Saved',
      message: 'Settings updated.',
      type: 'success',
    });
  };

  const updateKitchenRouting = (routing: KitchenRoutingSettings) => {
    setSettings((prev) => ({
      ...prev,
      kitchenRouting: routing,
    }));
    addNotification({
      title: 'Kitchen Routing Saved',
      message: 'Category routing updated for Kitchen 1 & 2.',
      type: 'success',
    });
  };

  const updateBackupSettings = (data: Partial<BackupSettings>) => {
    setSettings((prev) => ({
      ...prev,
      backup: { ...prev.backup, ...data },
    }));
  };

  const updateNetworkSettings = (data: Partial<NetworkSettings>) => {
    setSettings((prev) => ({
      ...prev,
      network: { ...prev.network, ...data },
    }));
  };

  const triggerManualBackup = () => {
    const backupData = {
      backupDate: new Date().toISOString(),
      restaurant: settings.general.restaurantName,
      categories,
      menuItems,
      inventory,
      orders,
      users,
      settings,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `Shalom_POS_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setSettings((prev) => ({
      ...prev,
      backup: {
        ...prev.backup,
        lastBackupTime: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} (Manual Export)`,
        status: 'healthy',
      },
    }));

    addNotification({
      title: 'Backup Successful',
      message: 'Complete database snapshot exported to JSON.',
      type: 'success',
    });
  };

  const testPrinter = async (printerName: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        addNotification({
          title: 'Printer Test Successful',
          message: `Test ticket simulated for ${printerName}. No physical printer connection was attempted.`,
          type: 'success',
        });
        resolve(true);
      }, 700);
    });
  };

  const testCashDrawer = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        addNotification({
          title: 'Cash drawer simulated',
          message: `Frontend drawer pulse simulated via ${settings.cashDrawer.connectedPrinter}.`,
          type: 'info',
        });
        resolve(true);
      }, 500);
    });
  };

  return (
    <PosContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        currentUser,
        users,
        addUser,
        updateUser,
        deleteUser,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleHideMenuItem,
        toggleAvailability,
        orderType,
        setOrderType,
        selectedTable,
        setSelectedTable,
        customerName,
        setCustomerName,
        customerPhone,
        setCustomerPhone,
        deliveryAddress,
        setDeliveryAddress,
        orderNotes,
        setOrderNotes,
        discount,
        setDiscount,
        discountType,
        setDiscountType,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        updateItemNotes,
        replaceCartLine,
        clearCart,
        subtotal,
        discountAmount,
        taxAmount,
        serviceChargeAmount,
        grandTotal,
        orders,
        createOrder,
        pendingPaymentOrder,
        completePendingPayment,
        updateOrderStatus,
        advanceKitchenStation,
        updatePaymentStatus,
        cancelOrder,
        recallOrderToCart,
        heldOrders,
        holdCurrentOrder,
        recallHeldOrder,
        deleteHeldOrder,
        tables,
        updateTableStatus,
        inventory,
        stockTransactions,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        stockIn,
        stockOut,
        adjustStock,
        settings,
        updateGeneralSettings,
        updatePrinterConfig,
        updateCashDrawerSettings,
        updateKitchenRouting,
        updateBackupSettings,
        updateNetworkSettings,
        triggerManualBackup,
        testPrinter,
        testCashDrawer,
        notifications,
        addNotification,
        markNotificationAsRead,
        clearAllNotifications,
        currentTime,
      }}
    >
      {children}
    </PosContext.Provider>
  );
};

export const usePos = () => {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePos must be used within a PosProvider');
  }
  return context;
};
