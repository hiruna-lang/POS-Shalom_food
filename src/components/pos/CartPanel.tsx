import React, { useEffect, useRef, useState } from 'react';
import { usePos } from '../../context/PosContext';
import {
  Trash2,
  Plus,
  Minus,
  Utensils,
  ShoppingBag,
  CreditCard,
  Banknote,
  Printer,
  ChefHat,
  Tag,
  FileText,
  User,
  Phone,
  X,
  Edit3,
  PauseCircle,
  PlayCircle,
  Clock
} from 'lucide-react';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';
import { KotModal } from './KotModal';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { TableSelectorModal } from './TableSelectorModal';
import { usePreferences } from '../../utils/preferences';
import { formatLkr } from '../../utils/billing';
import { CartItem, Order } from '../../types/pos';
import { sound } from '../../utils/sound';

export const CartPanel: React.FC<{ onEdit: (item: CartItem) => void }> = ({ onEdit }) => {
  const {
    orderType,
    setOrderType,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    orderNotes,
    setOrderNotes,
    cart,
    updateCartQuantity,
    removeFromCart,
    currentUser,
    orders,
    selectedTable,
    setSelectedTable,
    clearCart,
    subtotal,
    discount,
    setDiscount,
    discountType,
    setDiscountType,
    discountAmount,
    taxAmount,
    serviceChargeAmount,
    grandTotal,
    createOrder,
    pendingPaymentOrder,
    settings,
    heldOrders,
    holdCurrentOrder,
    recallHeldOrder,
  } = usePos();

  const { animations, reducedMotion } = usePreferences();
  const previousLines = useRef(cart);
  const lineElements = useRef(new Map<string, HTMLElement>());
  useEffect(() => {
    const prior = previousLines.current;
    previousLines.current = cart;
    if (prior === cart) return;
    const changed = cart.filter(line => !prior.includes(line));
    const latest = changed[changed.length - 1];
    if (latest) lineElements.current.get(latest.lineId ?? latest.menuItem.id)?.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    if (!animations || reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    cart.forEach((line) => {
      if (prior.includes(line)) return;
      lineElements.current.get(line.lineId ?? line.menuItem.id)?.animate(
        [{ backgroundColor: '#dbeafe' }, { backgroundColor: 'transparent' }],
        { duration: 350, easing: 'ease-out' },
      );
    });
  }, [cart, animations, reducedMotion]);

  // Modals state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showKotModal, setShowKotModal] = useState(false);
  const [showHeldModal, setShowHeldModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [lastReceipt, setLastReceipt] = useState<Order | null>(null);

  const [showTables, setShowTables] = useState(false);

  // Discount input toggle
  const [showDiscountInput, setShowDiscountInput] = useState(false);

  // Handle Send to Kitchen (KOT)
  const handleSendToKitchen = () => {
    if (cart.length === 0 || pendingPaymentOrder) return;
    const order = createOrder(undefined, undefined, true);
    setLastOrder(order);
    setShowKotModal(true);
  };

  // Handle Payment completion from modal
  const handlePaymentSuccess = (order: Order) => {
    setLastReceipt(order);
    setShowPaymentModal(false);
    setShowReceiptModal(true);
    if (settings.printers.customerBill.isEnabled && settings.printers.customerBill.autoPrint) {
      requestAnimationFrame(() => window.print());
    }
  };

  const paymentTotal = pendingPaymentOrder ? pendingPaymentOrder.total : grandTotal;

  return (
    <div className="cart-content">
      {/* 1. Order Type Selection Tabs */}
      <div className="cart-order-controls px-3 py-2 border-b border-slate-200">
        <div className="flex min-h-11 items-center justify-between gap-2 text-sm">
          <strong className="text-slate-600">{pendingPaymentOrder?.orderNumber ?? `Order #${1001 + orders.length}`}</strong>
          {orderType === 'dine_in' && <button type="button" className="secondary-action" onClick={() => setShowTables(true)}>{selectedTable ? `Table ${selectedTable.number}` : 'Select table'}</button>}
        </div>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/80 rounded-xl">
          <button
            type="button"
            onClick={() => setOrderType('dine_in')}
            className={`flex items-center justify-center space-x-1.5 min-h-11 rounded-lg text-xs font-bold transition-all ${
              orderType === 'dine_in'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Dine-in</span>
          </button>
          <button
            type="button"
            onClick={() => setOrderType('takeaway')}
            className={`flex items-center justify-center space-x-1.5 min-h-11 rounded-lg text-xs font-bold transition-all ${
              orderType === 'takeaway'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Takeaway</span>
          </button>
        </div>

        {/* Customer information for takeaway orders */}
        <div className="mt-2.5">
          {orderType === 'takeaway' && (
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 2. Cart Items List */}
      <div className="cart-orders px-3" role="region" aria-label="Foods in current bill" tabIndex={0}>
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 py-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <ShoppingBag className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-600">Cart is empty</p>
            <p className="text-xs text-slate-400 text-center max-w-[200px] mt-1">
              Select dishes from the menu to start creating this order
            </p>
          </div>
        ) : (
          cart.map((item) => {
            const id = item.lineId ?? item.menuItem.id;
            return (
              <article key={id} className="cart-line" ref={(element) => {
                if (element) lineElements.current.set(id, element);
                else lineElements.current.delete(id);
              }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 cart-line-description">
                    <h3 className="text-sm font-bold">{item.menuItem.name}</h3>
                    <p className="text-xs text-slate-600">{item.portion && `${item.portion} / `}{formatLkr(item.menuItem.price)} each</p>
                  </div>
                  <strong className="shrink-0 text-sm tabular-nums">{formatLkr(Math.round(item.menuItem.price * 100) * item.quantity / 100)}</strong>
                </div>
                <div className="cart-line-controls mt-1 flex items-center gap-1">
                  <button type="button" className="secondary-action" aria-label={`Edit ${item.menuItem.name}`} onClick={() => onEdit(item)}><Edit3 size={15} /></button>
                  <button type="button" className="secondary-action text-rose-600" aria-label={`Remove ${item.menuItem.name}`} onClick={() => removeFromCart(id)}><Trash2 size={15} /></button>
                  <div className="ml-auto flex items-center gap-1">
                    <button type="button" className="secondary-action" aria-label="Decrease quantity" onClick={() => updateCartQuantity(id, -1)}><Minus size={16} /></button>
                    <span className="w-6 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
                    <button type="button" className="secondary-action" aria-label="Increase quantity" onClick={() => updateCartQuantity(id, 1)}><Plus size={16} /></button>
                  </div>
                </div>
                {item.notes && <p className="mt-1 break-words text-xs text-slate-600">{item.notes}</p>}
              </article>
            );
          })
        )}
      </div>

      {/* 3. Financial Totals & Discounts */}
      <div className="cart-billing">
        <details className="cart-bill-details">
          <summary>Bill details <span>{formatLkr(subtotal)} subtotal</span></summary>
          <div className="cart-bill-breakdown">
        {/* Overall Order Note toggle */}
        <div className="flex items-center justify-between text-xs">
          <input
            type="text"
            placeholder="Order note (e.g. VIP guest, urgent)..."
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Calculation Lines */}
        <div className="space-y-1 text-xs text-slate-600 pt-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-800">
              Rs. {subtotal.toLocaleString()}
            </span>
          </div>

          {/* Discount Line */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              disabled={currentUser.role === 'cashier'}
              onClick={() => setShowDiscountInput(!showDiscountInput)}
              className="text-blue-600 hover:underline flex items-center space-x-1"
            >
              <Tag className="w-3 h-3" />
              <span>Discount {discount > 0 ? `(${discount}${discountType === 'percentage' ? '%' : ' LKR'})` : ''}</span>
            </button>
            <span className="text-emerald-600 font-semibold">
              {discountAmount > 0 ? `- Rs. ${discountAmount.toLocaleString()}` : 'Rs. 0'}
            </span>
          </div>

          {/* Collapsible Discount Input */}
          {showDiscountInput && currentUser.role !== 'cashier' && (
            <div className="p-2 bg-white rounded-lg border border-blue-200 flex items-center space-x-2">
              <input
                type="number"
                min="0"
                value={discount || ''}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                placeholder="Value"
                className="w-20 px-2 py-1 border border-slate-300 rounded text-xs"
              />
              <div className="flex rounded border border-slate-300 overflow-hidden text-[10px]">
                <button
                  type="button"
                  onClick={() => setDiscountType('percentage')}
                  className={`px-2 py-1 font-bold ${
                    discountType === 'percentage' ? 'bg-blue-600 text-white' : 'bg-slate-100'
                  }`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('fixed')}
                  className={`px-2 py-1 font-bold ${
                    discountType === 'fixed' ? 'bg-blue-600 text-white' : 'bg-slate-100'
                  }`}
                >
                  LKR
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowDiscountInput(false)}
                className="text-[10px] text-blue-600 font-bold ml-auto"
              >
                Done
              </button>
            </div>
          )}

          {/* Taxes & Service Charge */}
          <div className="flex justify-between">
            <span>Govt Tax (SSCL {settings.general.taxRate}%)</span>
            <span className="font-semibold text-slate-800">
              Rs. {taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {orderType === 'dine_in' && (
            <div className="flex justify-between">
              <span>Service Charge ({settings.general.serviceChargeRate}%)</span>
              <span className="font-semibold text-slate-800">
                Rs. {serviceChargeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}

        </div>
          </div>
        </details>
        <div className="cart-visible-total">
          <strong>Current bill total</strong>
          <strong>{formatLkr(grandTotal)}</strong>
        </div>
      </div>

      {/* Compact fixed controls reserve most of the panel for food items. */}
      <div className="cart-actions">
        {pendingPaymentOrder && <div className="cart-pending-note">
          Pending: {pendingPaymentOrder.orderNumber} <strong>{formatLkr(paymentTotal)}</strong>
        </div>}
        <div className="cart-primary-actions">
          <button type="button" className="secondary-action cart-kot-action" disabled={cart.length === 0 || !!pendingPaymentOrder} onClick={handleSendToKitchen}>
            <ChefHat size={16} /><span>Send KOT</span>
          </button>
          <button type="button" className="secondary-action" disabled={!lastReceipt} onClick={() => setShowReceiptModal(true)}>
            <Printer size={16} /><span>Receipt</span>
          </button>
          <button type="button" className="primary-action cart-pay-action" disabled={!pendingPaymentOrder && cart.length === 0} onClick={() => setShowPaymentModal(true)}>
            <CreditCard size={17} /><span>{pendingPaymentOrder ? 'Pay pending' : 'Pay now'}</span>
          </button>
        </div>
        <div className="cart-secondary-actions">
          <button type="button" className="secondary-action" disabled={!cart.length} onClick={() => holdCurrentOrder()}><PauseCircle size={16} /> Hold</button>
          <button type="button" className="secondary-action" disabled={!heldOrders.length} onClick={() => setShowHeldModal(true)}><PlayCircle size={16} /> Held ({heldOrders.length})</button>
          <button type="button" className="secondary-action cart-clear-action" disabled={!cart.length} onClick={() => setShowClearConfirm(true)}><Trash2 size={15} /> Clear</button>
        </div>
      </div>

      <Modal isOpen={showHeldModal} onClose={() => setShowHeldModal(false)} title="Held orders">
        {cart.length > 0 && <p className="mb-3 text-sm text-slate-600">Hold the current order before resuming another.</p>}
        <div className="space-y-2">
          {heldOrders.map((order) => <div key={order.id} className="surface flex items-center justify-between gap-2 p-2">
            <span><strong>{order.label}</strong><small className="block text-slate-600">{order.timestamp} / {formatLkr(order.subtotal)}</small></span>
            <button type="button" className="secondary-action" disabled={cart.length > 0} onClick={() => { recallHeldOrder(order.id); setShowHeldModal(false); }}>Resume</button>
          </div>)}
        </div>
      </Modal>
      {/* Modals */}
      <TableSelectorModal isOpen={showTables} onClose={() => setShowTables(false)} onSelectTable={(table) => { setSelectedTable(table); setShowTables(false); }} />
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={clearCart}
        title="Clear current bill?"
        message="All items, notes, and discount details will be removed from this bill."
        confirmText="Clear Bill"
        variant="danger"
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        totalAmount={paymentTotal}
        onPaymentSuccess={handlePaymentSuccess}
        pendingOrder={pendingPaymentOrder}
      />

      {lastReceipt && <ReceiptModal isOpen={showReceiptModal} onClose={() => setShowReceiptModal(false)} order={lastReceipt} />}
      {lastOrder && <KotModal isOpen={showKotModal} onClose={() => setShowKotModal(false)} order={lastOrder} />}
    </div>
  );
};

