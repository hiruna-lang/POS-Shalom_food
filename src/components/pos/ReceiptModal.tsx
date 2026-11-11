import React from 'react';
import { Modal } from '../common/Modal';
import { Order } from '../../types/pos';
import { usePos } from '../../context/PosContext';
import { Printer, CheckCircle, Share2, Download } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const { settings, testPrinter } = usePos();

  const handlePrint = () => {
    testPrinter(settings.printers.customerBill.name);
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customer Bill Preview"
      subtitle={`Receipt for ${order.orderNumber}`}
      maxWidth="md"
    >
      <div className="flex flex-col items-center">
        {/* Printable 80mm Thermal Receipt Simulation */}
        <div
          id="printable-receipt"
          className="w-full bg-white p-6 border border-slate-300 rounded-lg shadow-inner font-mono text-xs text-slate-800 leading-tight select-text"
        >
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-400 space-y-1">
            <h2 className="text-base font-black tracking-wider uppercase text-slate-900">
              {settings.general.restaurantName}
            </h2>
            <p className="text-[11px] text-slate-600 font-sans">{settings.general.branchName}</p>
            <p className="text-[10px] text-slate-500 font-sans">{settings.general.address}</p>
            <p className="text-[10px] text-slate-500">Tel: {settings.general.phone}</p>
            <p className="text-[10px] text-slate-400">VAT/SSCL Reg: 409188200-7000</p>
          </div>

          {/* Meta Info */}
          <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Order No:</span>
              <span className="font-bold">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date & Time:</span>
              <span>{new Date(order.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Order Type:</span>
              <span className="font-bold uppercase">{order.type.replace('_', ' ')}</span>
            </div>
            {order.tableName && (
              <div className="flex justify-between">
                <span>Table:</span>
                <span className="font-bold">{order.tableName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{order.cashierName}</span>
            </div>
            {order.customerName && (
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{order.customerName}</span>
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <div className="py-2.5 border-b border-dashed border-slate-400">
            <div className="flex justify-between font-bold text-[11px] pb-1 border-b border-slate-300 mb-1.5">
              <span className="w-1/2">Item Description</span>
              <span className="w-1/6 text-center">Qty</span>
              <span className="w-1/3 text-right">Amount</span>
            </div>
            <div className="space-y-1.5">
              {order.items.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-[11px]">
                    <span className="w-1/2 truncate font-medium">{item.menuItem.name}</span>
                    <span className="w-1/6 text-center">{item.quantity}</span>
                    <span className="w-1/3 text-right">
                      {(item.menuItem.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-[9px] text-slate-500 italic pl-2">
                      * {item.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>Rs. {order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount:</span>
                <span>- Rs. {order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax (SSCL {settings.general.taxRate}%):</span>
              <span>Rs. {order.tax.toFixed(2)}</span>
            </div>
            {order.serviceCharge > 0 && (
              <div className="flex justify-between">
                <span>Service Charge ({settings.general.serviceChargeRate}%):</span>
                <span>Rs. {order.serviceCharge.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-slate-400 text-slate-900">
              <span>TOTAL (LKR):</span>
              <span>Rs. {order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Details */}
          {order.paymentStatus === 'paid' && (
            <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span className="uppercase font-bold">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Tendered / Paid:</span>
                <span>Rs. {(order.amountPaid || order.total).toFixed(2)}</span>
              </div>
              {order.changeDue !== undefined && order.changeDue > 0 && (
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Change Due:</span>
                  <span>Rs. {order.changeDue.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {/* Footer & Barcode */}
          <div className="pt-4 text-center space-y-2">
            <p className="text-[10px] text-slate-600 font-sans">{settings.general.receiptFooter}</p>
            <div className="py-1">
              {/* Barcode line representation */}
              <div className="h-9 w-48 mx-auto bg-[repeating-linear-gradient(90deg,#000,#000_2px,#fff_2px,#fff_4px,#000_4px,#000_7px,#fff_7px,#fff_8px)]" />
              <p className="text-[9px] tracking-widest text-slate-500 mt-1">{order.orderNumber}</p>
            </div>
            <p className="text-[9px] text-slate-400">Software: Shalom Smart POS • Colombo, LK</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 w-full mt-4">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center space-x-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};

