import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import {
  Trash2,
  Plus,
  Minus,
  Utensils,
  ShoppingBag,
  Truck,
  CreditCard,
  Banknote,
  Printer,
  ChefHat,
  Tag,
  FileText,
  User,
  Phone,
  MapPin,
  X,
  Edit3
} from 'lucide-react';
import { TableSelectorModal } from './TableSelectorModal';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';
import { KotModal } from './KotModal';
import { Order } from '../../types/pos';

export const CartPanel: React.FC = () => {
  const {
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
    cart,
    updateCartQuantity,
    removeFromCart,
    updateItemNotes,
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
    settings,
  } = usePos();

  // Modals state
  const [showTableModal, setShowTableModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showKotModal, setShowKotModal] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  // Note editing state for individual items
  const [editingNoteItemId, setEditingNoteItemId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  // Discount input toggle
  const [showDiscountInput, setShowDiscountInput] = useState(false);

  // Handle Send to Kitchen (KOT)
  const handleSendToKitchen = () => {
    if (cart.length === 0) return;
    const order = createOrder(undefined, undefined, true);
    setLastOrder(order);
    setShowKotModal(true);
  };

  // Handle Payment completion from modal
  const handlePaymentSuccess = (order: Order) => {
    setLastOrder(order);
    setShowPaymentModal(false);
    setShowReceiptModal(true);
  };

  return (
    <div className="w-full lg:w-96 xl:w-[420px] bg-white border-l border-slate-200 flex flex-col h-[calc(100vh-4rem)] shadow-lg select-none">
      {/* 1. Order Type Selection Tabs */}
      <div className="p-3 border-b border-slate-200 bg-slate-50">
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/80 rounded-xl">
          <button
            type="button"
            onClick={() => setOrderType('dine_in')}
            className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
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
            className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
              orderType === 'takeaway'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Takeaway</span>
          </button>
          <button
            type="button"
            onClick={() => setOrderType('delivery')}
            className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
              orderType === 'delivery'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Delivery</span>
          </button>
        </div>

        {/* Dynamic Context Header (Table selector or Delivery info) */}
        <div className="mt-2.5">
          {orderType === 'dine_in' && (
            <div
              onClick={() => setShowTableModal(true)}
              className="flex items-center justify-between p-2.5 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  {selectedTable ? selectedTable.number : '?'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {selectedTable ? `Table: ${selectedTable.number}` : 'Select Table'}
                  </p>
                  <p className="text-[10px] text-slate-500 capitalize">
                    {selectedTable ? `${selectedTable.section.replace('_', ' ')} • Capacity ${selectedTable.capacity}` : 'Tap to choose dining table'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-600 hover:underline">
                Change Table
              </span>
            </div>
          )}

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

          {orderType === 'delivery' && (
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="tel"
                  placeholder="Phone (e.g. +94 77...)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Delivery Address (Street, City)"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <ShoppingBag className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-600">Cart is empty</p>
            <p className="text-xs text-slate-400 text-center max-w-[200px] mt-1">
              Select dishes from the menu to start creating this order
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.menuItem.id}
              className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-2">
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.menuItem.kitchen === 'kitchen_1' ? 'bg-amber-500' : 'bg-cyan-500'
                      }`}
                      title={item.menuItem.kitchen === 'kitchen_1' ? 'Kitchen 1' : 'Kitchen 2'}
                    />
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                      {item.menuItem.name}
                    </h4>
                  </div>
                  <p className="text-xs font-semibold text-blue-600 mt-0.5">
                    Rs. {item.menuItem.price.toLocaleString()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.menuItem.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Item Note / Special Instructions */}
              <div className="mt-2 flex items-center justify-between text-xs">
                {editingNoteItemId === item.menuItem.id ? (
                  <div className="flex items-center space-x-1.5 w-full mt-1">
                    <input
                      type="text"
                      value={tempNote}
                      onChange={(e) => setTempNote(e.target.value)}
                      placeholder="e.g. Extra spicy, no onions"
                      className="flex-1 px-2 py-1 text-xs border border-blue-400 rounded-md focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        updateItemNotes(item.menuItem.id, tempNote);
                        setEditingNoteItemId(null);
                      }}
                      className="px-2 py-1 bg-blue-600 text-white rounded-md text-[10px] font-bold"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingNoteItemId(null)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setTempNote(item.notes || '');
                      setEditingNoteItemId(item.menuItem.id);
                    }}
                    className="flex items-center space-x-1 text-[11px] text-slate-500 hover:text-blue-600 truncate max-w-[180px]"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span className="truncate italic">
                      {item.notes ? `"${item.notes}"` : '+ Add kitchen note'}
                    </span>
                  </button>
                )}

                {/* Quantity Controls (Large Touch buttons) */}
                <div className="flex items-center space-x-1.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(item.menuItem.id, -1)}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-300 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-700 shadow-xs"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-bold text-xs text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(item.menuItem.id, 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-300 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-700 shadow-xs"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. Financial Totals & Discounts */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70 space-y-2">
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
          {showDiscountInput && (
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

          {/* Grand Total */}
          <div className="flex justify-between items-baseline pt-2 border-t border-slate-300 text-slate-900">
            <span className="text-sm font-extrabold uppercase">Total Amount</span>
            <span className="text-xl font-black text-blue-700">
              Rs. {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Action Buttons (KOT, Print Bill, Pay Now, Clear) */}
      <div className="p-3 bg-white border-t border-slate-200 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Send KOT Button */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={handleSendToKitchen}
            className="flex items-center justify-center space-x-1.5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChefHat className="w-4 h-4" />
            <span>Send KOT</span>
          </button>

          {/* Print Customer Bill Button */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={() => {
              const order = createOrder(undefined, undefined, false);
              setLastOrder(order);
              setShowReceiptModal(true);
            }}
            className="flex items-center justify-center space-x-1.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 active:bg-black text-white font-bold text-xs shadow-md transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            <Printer className="w-4 h-4" />
            <span>Print Bill</span>
          </button>
        </div>

        {/* Primary Payment Button */}
        <button
          type="button"
          disabled={cart.length === 0}
          onClick={() => setShowPaymentModal(true)}
          className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          <CreditCard className="w-5 h-5" />
          <span>Pay Now (Rs. {grandTotal.toLocaleString()})</span>
        </button>

        {cart.length > 0 && (
          <div className="flex justify-between items-center pt-1">
            <button
              type="button"
              onClick={clearCart}
              className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
            >
              Clear Cart
            </button>
            <span className="text-[11px] text-slate-400">
              {cart.reduce((s, i) => s + i.quantity, 0)} items in bill
            </span>
          </div>
        )}
      </div>

      {/* Modals */}
      <TableSelectorModal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        onSelectTable={(table) => setSelectedTable(table)}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        totalAmount={grandTotal}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {lastOrder && (
        <>
          <ReceiptModal
            isOpen={showReceiptModal}
            onClose={() => setShowReceiptModal(false)}
            order={lastOrder}
          />

          <KotModal
            isOpen={showKotModal}
            onClose={() => setShowKotModal(false)}
            order={lastOrder}
          />
        </>
      )}
    </div>
  );
};

