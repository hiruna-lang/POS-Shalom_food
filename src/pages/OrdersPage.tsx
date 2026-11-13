import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePos } from '../context/PosContext';
import { Order, OrderStatus, OrderType } from '../types/pos';
import {
  Search,
  Filter,
  Eye,
  Printer,
  ChefHat,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Utensils,
  ShoppingBag,
  Truck,
  CreditCard,
  Banknote,
  Tv,
  List,
  Flame,
  Coffee
} from 'lucide-react';
import { ReceiptModal } from '../components/pos/ReceiptModal';
import { KotModal } from '../components/pos/KotModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { sound } from '../utils/sound';

export const OrdersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialView = searchParams.get('view') === 'kds' ? 'kds' : 'table';
  const [viewMode, setViewMode] = useState<'table' | 'kds'>(initialView);

  const {
    orders,
    updateOrderStatus,
    updatePaymentStatus,
    cancelOrder,
    settings,
  } = usePos();

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [kdsFilter, setKdsFilter] = useState<'all' | 'kitchen_1' | 'kitchen_2'>('all');

  // Modals
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [kotOrder, setKotOrder] = useState<Order | null>(null);
  const [cancelTargetOrder, setCancelTargetOrder] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (selectedStatus !== 'all' && order.orderStatus !== selectedStatus) {
        return false;
      }
      if (selectedType !== 'all' && order.type !== selectedType) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesNum = order.orderNumber.toLowerCase().includes(query);
        const matchesCustomer = order.customerName?.toLowerCase().includes(query);
        const matchesTable = order.tableName?.toLowerCase().includes(query);
        if (!matchesNum && !matchesCustomer && !matchesTable) {
          return false;
        }
      }
      return true;
    });
  }, [orders, selectedStatus, selectedType, searchQuery]);

  // Active Kitchen Queue orders for KDS
  const activeKdsOrders = useMemo(() => {
    return orders.filter(
      (o) => o.orderStatus === 'pending' || o.orderStatus === 'in_kitchen'
    );
  }, [orders]);

  const getStatusBadge = (status: OrderStatus) => {
    const config = {
      pending: { label: 'Pending', bg: 'bg-amber-100 text-amber-800 border-amber-300' },
      in_kitchen: { label: 'In Kitchen', bg: 'bg-sky-100 text-sky-800 border-sky-300' },
      ready: { label: 'Ready for Service', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
      completed: { label: 'Completed', bg: 'bg-slate-100 text-slate-700 border-slate-300' },
      cancelled: { label: 'Cancelled', bg: 'bg-rose-100 text-rose-800 border-rose-300' },
    }[status];

    return (
      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${config.bg}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto select-none font-sans">
      {/* Header with View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {viewMode === 'kds' ? 'Kitchen Display System (KDS)' : 'Orders & Kitchen Queue'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {viewMode === 'kds'
              ? 'Back-of-house kitchen prep display for cooks & baristas'
              : 'Track live dine-in, takeaway, and delivery orders with instant status updates.'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View mode toggle */}
          <div className="flex rounded-xl border border-slate-300 bg-white p-1 text-xs font-bold shadow-xs">
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                setViewMode('table');
                setSearchParams({});
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Table View</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                setViewMode('kds');
                setSearchParams({ view: 'kds' });
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'kds' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>Kitchen Display (KDS)</span>
            </button>
          </div>

          <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-700">
            {activeKdsOrders.length} In Queue
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: KITCHEN DISPLAY SYSTEM (KDS) */}
      {viewMode === 'kds' ? (
        <div className="space-y-4">
          {/* Kitchen Filter Tabs */}
          <div className="flex items-center space-x-2 bg-slate-900 text-white p-2 rounded-2xl">
            <button
              type="button"
              onClick={() => setKdsFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                kdsFilter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Kitchen Lines
            </button>
            <button
              type="button"
              onClick={() => setKdsFilter('kitchen_1')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                kdsFilter === 'kitchen_1' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Kitchen 1 (Hot/Main)</span>
            </button>
            <button
              type="button"
              onClick={() => setKdsFilter('kitchen_2')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                kdsFilter === 'kitchen_2' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Kitchen 2 (Bar/Cold)</span>
            </button>
          </div>

          {/* KDS Kitchen Ticket Cards Grid */}
          {activeKdsOrders.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
              <ChefHat className="w-16 h-16 mx-auto text-slate-300 mb-2" />
              <h3 className="text-lg font-bold text-slate-700">Kitchen Display Queue Clear</h3>
              <p className="text-xs text-slate-400">All incoming restaurant orders have been prepared and served.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeKdsOrders.map((order) => {
                // Filter items for selected kitchen
                const itemsToShow = order.items.filter((item) => {
                  if (kdsFilter === 'all') return true;
                  const target = settings.kitchenRouting[item.menuItem.categoryId] || item.menuItem.kitchen;
                  return target === kdsFilter;
                });

                if (itemsToShow.length === 0) return null;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl border-2 border-slate-300 shadow-md flex flex-col justify-between overflow-hidden"
                  >
                    {/* Ticket Header */}
                    <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-black">{order.orderNumber}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500 text-white">
                            {order.type.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-xs text-slate-300 font-semibold block mt-0.5">
                          {order.tableName || order.customerName || 'Guest'}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-amber-400 flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>12m ago</span>
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Line Items List */}
                    <div className="p-4 flex-1 space-y-2.5 divide-y divide-slate-100">
                      {itemsToShow.map((it, idx) => (
                        <div key={idx} className="pt-2 first:pt-0 flex items-start justify-between">
                          <div>
                            <span className="text-sm font-black text-slate-900">
                              {it.quantity}x {it.menuItem.name}
                            </span>
                            {it.notes && (
                              <p className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded mt-0.5">
                                Note: {it.notes}
                              </p>
                            )}
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 shrink-0 ${
                              (settings.kitchenRouting[it.menuItem.categoryId] || it.menuItem.kitchen) === 'kitchen_1'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-cyan-100 text-cyan-800'
                            }`}
                          >
                            {(settings.kitchenRouting[it.menuItem.categoryId] || it.menuItem.kitchen) === 'kitchen_1'
                              ? 'Kitchen 1'
                              : 'Kitchen 2'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Bump / Action Footer */}
                    <div className="p-3 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playTap();
                          setKotOrder(order);
                        }}
                        className="py-2.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 transition-colors"
                      >
                        Reprint KOT
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playSuccess();
                          updateOrderStatus(order.id, 'ready');
                        }}
                        className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-colors flex items-center justify-center space-x-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Bump (Ready)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* VIEW MODE 2: TABLE VIEW */
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search order #, customer, table..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            {/* Status Pill Filters */}
            <div className="flex items-center space-x-1.5 w-full md:w-auto overflow-x-auto">
              {[
                { id: 'all', label: 'All Status' },
                { id: 'pending', label: 'Pending' },
                { id: 'in_kitchen', label: 'In Kitchen' },
                { id: 'ready', label: 'Ready' },
                { id: 'completed', label: 'Completed' },
                { id: 'cancelled', label: 'Cancelled' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStatus(st.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedStatus === st.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Order #</th>
                    <th className="py-3.5 px-4">Type / Location</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Items Summary</th>
                    <th className="py-3.5 px-4">Total (LKR)</th>
                    <th className="py-3.5 px-4">Payment</th>
                    <th className="py-3.5 px-4">Order Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No orders match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div>{order.orderNumber}</div>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1.5">
                            {order.type === 'dine_in' && <Utensils className="w-3.5 h-3.5 text-blue-600" />}
                            {order.type === 'takeaway' && <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />}
                            {order.type === 'delivery' && <Truck className="w-3.5 h-3.5 text-indigo-600" />}
                            <span className="capitalize font-bold text-slate-800">
                              {order.type.replace('_', ' ')}
                            </span>
                          </div>
                          {order.tableName && (
                            <span className="text-[11px] text-slate-500 block">{order.tableName}</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{order.customerName || 'Walk-in'}</div>
                          {order.customerPhone && (
                            <div className="text-[10px] text-slate-400">{order.customerPhone}</div>
                          )}
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <p className="truncate text-slate-800 font-medium">
                            {order.items.map((i) => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            Total {order.items.reduce((s, i) => s + i.quantity, 0)} items
                          </span>
                        </td>

                        <td className="py-3 px-4 font-bold text-slate-900">
                          Rs. {order.total.toLocaleString()}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold uppercase ${
                              order.paymentStatus === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                          {order.paymentMethod && (
                            <span className="block text-[10px] text-slate-400 uppercase mt-0.5">
                              {order.paymentMethod}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">{getStatusBadge(order.orderStatus)}</td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {order.orderStatus === 'in_kitchen' && (
                              <button
                                type="button"
                                onClick={() => {
                                  sound.playSuccess();
                                  updateOrderStatus(order.id, 'ready');
                                }}
                                className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors"
                                title="Mark Order as Ready"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}

                            {order.orderStatus === 'ready' && (
                              <button
                                type="button"
                                onClick={() => {
                                  sound.playSuccess();
                                  updateOrderStatus(order.id, 'completed');
                                }}
                                className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
                                title="Mark Order as Completed & Delivered"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                sound.playTap();
                                setReceiptOrder(order);
                              }}
                              className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                              title="View & Print Customer Bill"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                sound.playTap();
                                setKotOrder(order);
                              }}
                              className="p-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                              title="Reprint Kitchen Order Ticket (KOT)"
                            >
                              <ChefHat className="w-4 h-4" />
                            </button>

                            {order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled' && (
                              <button
                                type="button"
                                onClick={() => setCancelTargetOrder(order)}
                                className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                                title="Void / Cancel Order"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {receiptOrder && (
        <ReceiptModal
          isOpen={!!receiptOrder}
          onClose={() => setReceiptOrder(null)}
          order={receiptOrder}
        />
      )}

      {kotOrder && (
        <KotModal
          isOpen={!!kotOrder}
          onClose={() => setKotOrder(null)}
          order={kotOrder}
        />
      )}

      {cancelTargetOrder && (
        <ConfirmDialog
          isOpen={!!cancelTargetOrder}
          onClose={() => setCancelTargetOrder(null)}
          onConfirm={() => cancelOrder(cancelTargetOrder.id, 'Voided by cashier')}
          title={`Cancel Order ${cancelTargetOrder.orderNumber}?`}
          message="Are you sure you want to cancel this order? If assigned to a table, the table will be freed."
          confirmText="Yes, Cancel Order"
          variant="danger"
        />
      )}
    </div>
  );
};
