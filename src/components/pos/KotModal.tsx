import React from 'react';
import { Modal } from '../common/Modal';
import { Order } from '../../types/pos';
import { usePos } from '../../context/PosContext';
import { Printer, ChefHat, Flame, Coffee, CheckCircle } from 'lucide-react';

interface KotModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

export const KotModal: React.FC<KotModalProps> = ({ isOpen, onClose, order }) => {
  const { settings, testPrinter } = usePos();

  // Filter items by Kitchen target routing
  const kitchen1Items = order.items.filter((item) => {
    const routing = settings.kitchenRouting[item.menuItem.categoryId] || item.menuItem.kitchen;
    return routing === 'kitchen_1';
  });

  const kitchen2Items = order.items.filter((item) => {
    const routing = settings.kitchenRouting[item.menuItem.categoryId] || item.menuItem.kitchen;
    return routing === 'kitchen_2';
  });

  const handlePrintBoth = () => {
    if (kitchen1Items.length > 0) {
      testPrinter(settings.printers.kitchen1.name);
    }
    if (kitchen2Items.length > 0) {
      testPrinter(settings.printers.kitchen2.name);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kitchen Order Tickets (KOT)"
      subtitle={`Kitchen routing preview for ${order.orderNumber}`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center space-x-2">
          <ChefHat className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Tickets are routed automatically through Ethernet LAN to dedicated kitchen printers.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Kitchen 1 Ticket Preview */}
          <div className="border border-slate-300 rounded-xl p-4 bg-white shadow-xs font-mono text-xs text-slate-800">
            <div className="border-b border-dashed border-slate-400 pb-2 mb-2 text-center">
              <div className="flex items-center justify-center space-x-1 text-amber-700 font-bold">
                <Flame className="w-4 h-4" />
                <span className="uppercase font-sans font-black">KITCHEN 1 (HOT PREP)</span>
              </div>
              <p className="text-[10px] text-slate-500 font-sans">{settings.printers.kitchen1.name}</p>
              <p className="text-[10px] text-slate-400">LAN IP: {settings.printers.kitchen1.ipAddress}:9100</p>
            </div>

            <div className="space-y-0.5 border-b border-dashed border-slate-400 pb-2 text-[11px]">
              <div className="flex justify-between">
                <span>Order #:</span>
                <span className="font-bold">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-bold uppercase">{order.type.replace('_', ' ')}</span>
              </div>
              {order.tableName && (
                <div className="flex justify-between">
                  <span>Table:</span>
                  <span className="font-bold text-amber-700">{order.tableName}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Time:</span>
                <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            <div className="py-2 space-y-1.5 min-h-[90px]">
              {kitchen1Items.length === 0 ? (
                <p className="text-slate-400 italic text-center py-4">No items for Kitchen 1</p>
              ) : (
                kitchen1Items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-xs font-bold">
                    <span className="w-4/5">
                      {item.menuItem.name}
                      {item.notes && (
                        <span className="block text-[10px] font-normal text-rose-600">
                          NOTE: {item.notes}
                        </span>
                      )}
                    </span>
                    <span className="w-1/5 text-right font-black text-sm">x{item.quantity}</span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-dashed border-slate-400 text-center text-[10px] text-slate-400">
              -- END OF KITCHEN 1 TICKET --
            </div>
          </div>

          {/* Kitchen 2 Ticket Preview */}
          <div className="border border-slate-300 rounded-xl p-4 bg-white shadow-xs font-mono text-xs text-slate-800">
            <div className="border-b border-dashed border-slate-400 pb-2 mb-2 text-center">
              <div className="flex items-center justify-center space-x-1 text-cyan-700 font-bold">
                <Coffee className="w-4 h-4" />
                <span className="uppercase font-sans font-black">KITCHEN 2 (BEVERAGE/DESSERT)</span>
              </div>
              <p className="text-[10px] text-slate-500 font-sans">{settings.printers.kitchen2.name}</p>
              <p className="text-[10px] text-slate-400">LAN IP: {settings.printers.kitchen2.ipAddress}:9100</p>
            </div>

            <div className="space-y-0.5 border-b border-dashed border-slate-400 pb-2 text-[11px]">
              <div className="flex justify-between">
                <span>Order #:</span>
                <span className="font-bold">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-bold uppercase">{order.type.replace('_', ' ')}</span>
              </div>
              {order.tableName && (
                <div className="flex justify-between">
                  <span>Table:</span>
                  <span className="font-bold text-cyan-700">{order.tableName}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Time:</span>
                <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            <div className="py-2 space-y-1.5 min-h-[90px]">
              {kitchen2Items.length === 0 ? (
                <p className="text-slate-400 italic text-center py-4">No items for Kitchen 2</p>
              ) : (
                kitchen2Items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-xs font-bold">
                    <span className="w-4/5">
                      {item.menuItem.name}
                      {item.notes && (
                        <span className="block text-[10px] font-normal text-rose-600">
                          NOTE: {item.notes}
                        </span>
                      )}
                    </span>
                    <span className="w-1/5 text-right font-black text-sm">x{item.quantity}</span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-dashed border-slate-400 text-center text-[10px] text-slate-400">
              -- END OF KITCHEN 2 TICKET --
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            type="button"
            onClick={handlePrintBoth}
            className="flex-1 flex items-center justify-center space-x-2 py-3.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-extrabold text-sm rounded-xl shadow-md transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Send & Print Tickets to LAN Kitchens</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

