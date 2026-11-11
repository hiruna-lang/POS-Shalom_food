export type KitchenTarget = 'kitchen_1' | 'kitchen_2';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  costPrice?: number;
  image: string;
  isAvailable: boolean;
  isHidden: boolean;
  kitchen: KitchenTarget;
  prepTime: number; // in minutes
  isSpicy?: boolean;
  isVegetarian?: boolean;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  image?: string;
  order: number;
  isEnabled: boolean;
  kitchenDefault: KitchenTarget;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export type OrderType = 'dine_in' | 'takeaway' | 'delivery';
export type OrderStatus = 'pending' | 'in_kitchen' | 'ready' | 'completed' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending';
export type PaymentMethod = 'cash' | 'card' | 'qr';

export interface Table {
  id: string;
  number: string;
  section: 'indoor' | 'outdoor' | 'ac_lounge';
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrderId?: string;
  customerName?: string;
  seatedSince?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  tableId?: string;
  tableName?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  tax: number;
  serviceCharge: number;
  total: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  amountPaid?: number;
  changeDue?: number;
  orderStatus: OrderStatus;
  kitchenStatus: {
    kitchen1: 'sent' | 'preparing' | 'ready' | 'na';
    kitchen2: 'sent' | 'preparing' | 'ready' | 'na';
  };
  createdAt: string;
  completedAt?: string;
  cashierId: string;
  cashierName: string;
  notes?: string;
}

export interface HeldOrder {
  id: string;
  label: string;
  timestamp: string;
  cart: CartItem[];
  orderType: OrderType;
  table: Table | null;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  orderNotes: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  subtotal: number;
}

export interface ShiftSession {
  id: string;
  cashierId: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  openingFloat: number;
  cashSales: number;
  cardSales: number;
  qrSales: number;
  cashPayouts: number;
  expectedCash: number;
  actualCash?: number;
  variance?: number;
  status: 'open' | 'closed';
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  image: string;
  category: string;
  unit: 'kg' | 'g' | 'L' | 'ml' | 'pieces' | 'packs';
  currentStock: number;
  minStockLevel: number;
  purchasePrice: number;
  supplier: string;
  expiryDate: string;
  lastRestocked: string;
}

export interface StockTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: 'stock_in' | 'stock_out' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  referenceNumber?: string;
  date: string;
  performedBy: string;
}

export type UserRole = 'cashier' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  pin: string;
  avatar: string;
  status: 'active' | 'inactive';
  permissions: string[];
}

export interface GeneralSettings {
  restaurantName: string;
  branchName: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  currencySymbol: string;
  taxRate: number; // e.g. 2.5%
  serviceChargeRate: number; // e.g. 10%
  timeZone: string;
  receiptFooter: string;
}

export interface PrinterConfig {
  name: string;
  connectionType: 'lan' | 'usb';
  ipAddress: string;
  port: number;
  paperWidth: '80mm' | '58mm';
  isEnabled: boolean;
  autoPrint?: boolean;
  target?: string;
  categories?: string[];
}

export interface CashDrawerSettings {
  model: string;
  connectedPrinter: string;
  pulseDurationMs: number;
  autoOpenOnCash: boolean;
}

export interface KitchenRoutingSettings {
  [categoryId: string]: KitchenTarget;
}

export interface BackupSettings {
  lastBackupTime: string;
  status: 'healthy' | 'warning' | 'error';
  frequency: 'hourly' | 'daily' | 'weekly';
  autoBackup: boolean;
}

export interface NetworkSettings {
  localServerIp: string;
  localPort: number;
  localStatus: 'connected' | 'disconnected';
  cloudSyncStatus: 'synced' | 'syncing' | 'offline';
  pendingSyncCount: number;
  pingMs: number;
}

export interface AppSettings {
  general: GeneralSettings;
  printers: {
    customerBill: PrinterConfig;
    kitchen1: PrinterConfig;
    kitchen2: PrinterConfig;
  };
  cashDrawer: CashDrawerSettings;
  kitchenRouting: KitchenRoutingSettings;
  backup: BackupSettings;
  network: NetworkSettings;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}
