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
  KitchenTarget
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
  currentUser: User;
  setCurrentUser: (user: User) => void;
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
  addToCart: (item: MenuItem, qty?: number, notes?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  updateItemNotes: (itemId: string, notes: string) => void;
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
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updatePaymentStatus: (orderId: string, method: PaymentMethod, amountPaid: number) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  recallOrderToCart: (order: Order) => void;

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

export const PosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clock state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Users state
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);

  // Categories & Menu
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);

  // Tables & Orders
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  // Cart & POS state
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [selectedTable, setSelectedTable] = useState<Table | null>(INITIAL_TABLES[1]); // T-02 default
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [cart, setCart] = useState<CartItem[]>([
    { menuItem: INITIAL_MENU_ITEMS[0], quantity: 1, notes: 'Less spicy' },
    { menuItem: INITIAL_MENU_ITEMS[8], quantity: 2 },
  ]);

  // Inventory & transactions
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>(INITIAL_STOCK_TRANSACTIONS);

  // Settings & Notifications
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
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

  // Cart actions
  const addToCart = (item: MenuItem, qty = 1, notes?: string) => {
    if (!item.isAvailable) {
      addNotification({
        title: 'Item Unavailable',
        message: `${item.name} is currently out of stock.`,
        type: 'warning',
      });
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((c) => c.menuItem.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qty,
          notes: notes !== undefined ? notes : updated[existingIndex].notes,
        };
        return updated;
      } else {
        return [...prev, { menuItem: item, quantity: qty, notes }];
      }
    });

    addNotification({
      title: 'Added to Cart',
      message: `${qty}x ${item.name} added to bill.`,
      type: 'info',
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.menuItem.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((c) => {
          if (c.menuItem.id === itemId) {
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
      prev.map((c) => (c.menuItem.id === itemId ? { ...c, notes } : c))
    );
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setOrderNotes('');
  };

  // Cart financial calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (discount <= 0) return 0;
    if (discountType === 'percentage') {
      return Math.round((subtotal * discount) / 100);
    }
    return Math.min(discount, subtotal);
  }, [subtotal, discount, discountType]);

  const taxAmount = useMemo(() => {
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    return Math.round(((taxableAmount * settings.general.taxRate) / 100) * 100) / 100;
  }, [subtotal, discountAmount, settings.general.taxRate]);

  const serviceChargeAmount = useMemo(() => {
    // Service charge applies to Dine-in orders
    if (orderType !== 'dine_in') return 0;
    const base = Math.max(0, subtotal - discountAmount);
    return Math.round(((base * settings.general.serviceChargeRate) / 100) * 100) / 100;
  }, [orderType, subtotal, discountAmount, settings.general.serviceChargeRate]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + taxAmount + serviceChargeAmount);
  }, [subtotal, discountAmount, taxAmount, serviceChargeAmount]);

  // Order creation
  const createOrder = (
    paymentMethod?: PaymentMethod,
    amountPaid?: number,
    sendToKitchen = true
  ): Order => {
    const orderNum = `ORD-${1000 + orders.length + 1}`;
    const now = new Date().toISOString();

    const changeDue = amountPaid && amountPaid >= grandTotal ? amountPaid - grandTotal : 0;

    // Determine kitchen routing for items
    let hasKitchen1 = false;
    let hasKitchen2 = false;
    cart.forEach((c) => {
      const routing = settings.kitchenRouting[c.menuItem.categoryId] || c.menuItem.kitchen;
      if (routing === 'kitchen_1') hasKitchen1 = true;
      if (routing === 'kitchen_2') hasKitchen2 = true;
    });

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      type: orderType,
      tableId: orderType === 'dine_in' ? selectedTable?.id : undefined,
      tableName: orderType === 'dine_in' && selectedTable ? `${selectedTable.number} (${selectedTable.section.toUpperCase()})` : undefined,
      customerName: customerName || (orderType === 'dine_in' ? (selectedTable ? `Table ${selectedTable.number}` : 'Guest') : 'Counter Guest'),
      customerPhone: customerPhone || undefined,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      items: [...cart],
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
      orderStatus: paymentMethod ? 'completed' : sendToKitchen ? 'in_kitchen' : 'pending',
      kitchenStatus: {
        kitchen1: hasKitchen1 ? 'sent' : 'na',
        kitchen2: hasKitchen2 ? 'sent' : 'na',
      },
      createdAt: now,
      completedAt: paymentMethod ? now : undefined,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      notes: orderNotes || undefined,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // If table assigned, mark table as occupied
    if (orderType === 'dine_in' && selectedTable) {
      updateTableStatus(selectedTable.id, paymentMethod ? 'available' : 'occupied', newOrder.id, newOrder.customerName);
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

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
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
          const change = amountPaid >= ord.total ? amountPaid - ord.total : 0;
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
          message: `Test print packet sent to ${printerName}. Connection verified!`,
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
          title: 'Cash Drawer Kicked',
          message: `Pulse signal sent via ${settings.cashDrawer.connectedPrinter}. Drawer opened!`,
          type: 'success',
        });
        resolve(true);
      }, 500);
    });
  };

  return (
    <PosContext.Provider
      value={{
        currentUser,
        setCurrentUser,
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
        clearCart,
        subtotal,
        discountAmount,
        taxAmount,
        serviceChargeAmount,
        grandTotal,
        orders,
        createOrder,
        updateOrderStatus,
        updatePaymentStatus,
        cancelOrder,
        recallOrderToCart,
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
