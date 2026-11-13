import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePos } from '../context/PosContext';
import { Modal } from '../components/common/Modal';
import { sound } from '../utils/sound';
import {
  Search,
  Plus,
  Lock,
  RotateCcw,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    setCurrentUser,
    users,
    orders,
    menuItems,
    currentTime,
    settings,
    addNotification,
  } = usePos();

  // Modals state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Live Metrics for Badges
  const activeKitchenOrdersCount = orders.filter(
    (o) => o.orderStatus === 'pending' || o.orderStatus === 'in_kitchen'
  ).length;

  const todayRevenue = orders
    .filter((o) => o.orderStatus === 'completed' || o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  // Return / Refund state
  const [refundOrderQuery, setRefundOrderQuery] = useState('');
  const [selectedRefundOrder, setSelectedRefundOrder] = useState<any | null>(null);
  const [refundReason, setRefundReason] = useState('Customer Change of Mind');

  // Format date & time with tabular-nums so seconds tick without layout shift
  const formattedDateTime =
    currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: '2-digit',
      year: 'numeric',
    }) +
    ' ' +
    currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

  const handleTileClick = (action: string) => {
    sound.playTap();
    switch (action) {
      case 'pos':
        navigate('/pos');
        break;
      case 'menu':
        navigate('/menu');
        break;
      case 'kds':
        navigate('/orders?view=kds');
        break;
      case 'reports':
        navigate('/reports');
        break;
      case 'staff':
        setShowEmployeeModal(true);
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'logout':
        setShowLogoutModal(true);
        break;
      default:
        break;
    }
  };

  const handleProcessRefund = () => {
    if (!selectedRefundOrder) return;
    sound.playCashRegister();
    addNotification({
      title: 'Refund Processed',
      message: `Order #${selectedRefundOrder.orderNumber} refunded (Rs. ${selectedRefundOrder.total.toLocaleString()}). Reason: ${refundReason}`,
      type: 'success',
    });
    setShowReturnModal(false);
    setSelectedRefundOrder(null);
    setRefundOrderQuery('');
  };

  return (
    <div className="h-full w-full bg-[#f4f6fa] flex flex-col justify-between p-3 sm:p-4 lg:p-5 select-none font-sans overflow-hidden overscroll-none">
      {/* 1. Fixed Top Header (Non-shifting) */}
      <header className="h-12 sm:h-14 shrink-0 flex items-center justify-between pb-2 sm:pb-3 border-b border-slate-200/90">
        {/* Left: Brand + Active Operator */}
        <div className="flex items-center space-x-2.5 sm:space-x-3.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-lime-400 flex items-center justify-center shadow-xs text-white font-black text-xs">
            SF
          </div>

          <div className="flex items-baseline space-x-1.5">
            <h1 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight flex items-center">
              <span>Shalom Food POS</span>
              <sup className="text-[10px] font-bold text-blue-600 ml-1 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                v2.0
              </sup>
            </h1>
            <span className="text-[11px] text-slate-400 hidden xl:inline">
              • Kollupitiya Main Flagship (LKR)
            </span>
          </div>

          <div className="pl-2.5 border-l border-slate-300 hidden sm:flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-700 capitalize">
              {currentUser.name} ({currentUser.role})
            </span>
          </div>
        </div>

        {/* Right: Live Stable Clock & Quick Tools */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="text-xs font-semibold text-slate-600 tracking-wide hidden sm:block font-mono tabular-nums">
            {formattedDateTime}
          </div>

          {/* Quick Return & Refund Button */}
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              setShowReturnModal(true);
            }}
            className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
            title="Refund & Void Settlement"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
            <span>Return</span>
          </button>

          {/* Pink Info Circle Button (i) */}
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              setShowInfoModal(true);
            }}
            className="w-7 h-7 rounded-full bg-[#e83e8c] hover:bg-[#d63384] active:scale-95 text-white font-serif italic font-bold text-xs flex items-center justify-center shadow-xs transition-all shrink-0"
            title="Software & Hardware Info"
          >
            i
          </button>
        </div>
      </header>

      {/* 2. Locked, Stable 3x3 Grid (Fills remaining height exactly, 0% scrollbar) */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-2.5 sm:py-3 overflow-hidden">
        <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-2.5 sm:gap-3.5 lg:gap-4">
          
          {/* 1. POS / Billing */}
          <button
            type="button"
            onClick={() => handleTileClick('pos')}
            className="group bg-[#7081df] hover:bg-[#6273d6] active:bg-[#5667ca] active:scale-[0.99] rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center shadow-xs hover:shadow-md transition-all cursor-pointer h-full w-full focus:outline-none relative overflow-hidden"
          >
            <span className="absolute top-2 right-2 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
              Register Open
            </span>

            <div className="mb-1 sm:mb-2 group-hover:scale-105 transition-transform">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white" viewBox="0 0 64 64" fill="currentColor">
                <path d="M20 8h24v12H20z" opacity="0.95" />
                <rect x="25" y="4" width="14" height="4" rx="1" fill="white" />
                <path d="M12 24h40l4 20H8l4-20z" />
                <rect x="20" y="28" width="6" height="4" rx="1" fill="#7081df" />
                <rect x="29" y="28" width="6" height="4" rx="1" fill="#7081df" />
                <rect x="38" y="28" width="6" height="4" rx="1" fill="#7081df" />
                <rect x="20" y="34" width="6" height="4" rx="1" fill="#7081df" />
                <rect x="29" y="34" width="6" height="4" rx="1" fill="#7081df" />
                <rect x="38" y="34" width="6" height="4" rx="1" fill="#7081df" />
                <rect x="8" y="44" width="48" height="12" rx="2" />
                <circle cx="32" cy="50" r="2.5" fill="#7081df" />
              </svg>
            </div>
            <span className="text-sm sm:text-base lg:text-lg font-black tracking-wide text-white text-center leading-tight">
              POS / Billing
            </span>
            <span className="text-[10px] sm:text-xs text-blue-100 mt-0.5 truncate max-w-[90%]">
              Dine-in & Takeaway
            </span>
          </button>

          {/* 2. Menu Management */}
          <button
            type="button"
            onClick={() => handleTileClick('menu')}
            className="group bg-[#7081df] hover:bg-[#6273d6] active:bg-[#5667ca] active:scale-[0.99] rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center shadow-xs hover:shadow-md transition-all cursor-pointer h-full w-full focus:outline-none relative overflow-hidden"
          >
            <span className="absolute top-2 right-2 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
              {menuItems.length} Dishes
            </span>

            <div className="mb-1 sm:mb-2 group-hover:scale-105 transition-transform">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="4">
                <path d="M12 44h40M8 50h48" strokeLinecap="round" />
                <path d="M16 44A16 16 0 0 1 48 44" fill="currentColor" fillOpacity="0.25" strokeLinecap="round" />
                <circle cx="32" cy="24" r="3.5" fill="currentColor" />
                <path d="M26 34h12M32 30v8" strokeLinecap="round" strokeWidth="3" />
              </svg>
            </div>
            <span className="text-sm sm:text-base lg:text-lg font-black tracking-wide text-white text-center leading-tight">
              Menu Management
            </span>
            <span className="text-[10px] sm:text-xs text-blue-100 mt-0.5 truncate max-w-[90%]">
              Dishes, Prices & Categories
            </span>
          </button>

          {/* 3. Orders & Kitchen */}
          <button
            type="button"
            onClick={() => handleTileClick('kds')}
            className="group bg-[#7081df] hover:bg-[#6273d6] active:bg-[#5667ca] active:scale-[0.99] rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center shadow-xs hover:shadow-md transition-all cursor-pointer h-full w-full focus:outline-none relative overflow-hidden"
          >
            {activeKitchenOrdersCount > 0 && (
              <span className="absolute top-2 right-2 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-xs">
                {activeKitchenOrdersCount} Active
              </span>
            )}

            <div className="mb-1 sm:mb-2 group-hover:scale-105 transition-transform">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white" viewBox="0 0 64 64" fill="currentColor">
                <rect x="8" y="12" width="48" height="40" rx="8" fill="white" />
                <rect x="15" y="19" width="34" height="26" rx="4" fill="#7081df" />
                <path d="M22 28h20M22 34h14" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm sm:text-base lg:text-lg font-black tracking-wide text-white text-center leading-tight">
              Orders & Kitchen
            </span>
            <span className="text-[10px] sm:text-xs text-blue-100 mt-0.5 truncate max-w-[90%]">
              Live orders and kitchen tickets
            </span>
          </button>

          {/* 5. Reports & Sales */}
          <button
            type="button"
            onClick={() => handleTileClick('reports')}
            className="group bg-[#7081df] hover:bg-[#6273d6] active:bg-[#5667ca] active:scale-[0.99] rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center shadow-xs hover:shadow-md transition-all cursor-pointer h-full w-full focus:outline-none relative overflow-hidden"
          >
            <span className="absolute top-2 right-2 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
              Rs. {todayRevenue.toLocaleString()}
            </span>

            <div className="mb-1 sm:mb-2 group-hover:scale-105 transition-transform">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white" viewBox="0 0 64 64" fill="currentColor">
                <path d="M22 6h20v22l-4-3-6 4-6-4-4 3V6z" fill="white" />
                <rect x="26" y="11" width="12" height="2" fill="#7081df" />
                <rect x="26" y="15" width="12" height="2" fill="#7081df" />
                <path d="M14 26h36c3 0 5 2 5 5v16c0 3-2 5-5 5H14c-3 0-5-2-5-5V31c0-3 2-5 5-5z" />
                <rect x="18" y="42" width="6" height="4" rx="1" fill="#7081df" />
                <rect x="26" y="42" width="6" height="4" rx="1" fill="#7081df" />
                <rect x="34" y="42" width="6" height="4" rx="1" fill="#7081df" />
                <rect x="42" y="42" width="6" height="4" rx="1" fill="#7081df" />
              </svg>
            </div>
            <span className="text-sm sm:text-base lg:text-lg font-black tracking-wide text-white text-center leading-tight">
              Reports & Sales
            </span>
            <span className="text-[10px] sm:text-xs text-blue-100 mt-0.5 truncate max-w-[90%]">
              Daily Revenue, Trends & PDF
            </span>
          </button>

          {/* 7. Staff & Cashiers */}
          <button
            type="button"
            onClick={() => handleTileClick('staff')}
            className="group bg-[#7081df] hover:bg-[#6273d6] active:bg-[#5667ca] active:scale-[0.99] rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center shadow-xs hover:shadow-md transition-all cursor-pointer h-full w-full focus:outline-none relative overflow-hidden"
          >
            <span className="absolute top-2 right-2 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
              {users.length} Staff
            </span>

            <div className="mb-1 sm:mb-2 group-hover:scale-105 transition-transform">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white" viewBox="0 0 64 64" fill="currentColor">
                <circle cx="28" cy="18" r="10" fill="white" />
                <path d="M10 48c0-10 8-18 18-18s18 8 18 18H10z" fill="white" />
                <circle cx="48" cy="38" r="12" fill="white" />
                <path d="M48 30v16M40 38h16" stroke="#7081df" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm sm:text-base lg:text-lg font-black tracking-wide text-white text-center leading-tight">
              Staff & Cashiers
            </span>
            <span className="text-[10px] sm:text-xs text-blue-100 mt-0.5 truncate max-w-[90%]">
              Roles, Accounts & PIN Codes
            </span>
          </button>

          {/* 8. System Settings */}
          <button
            type="button"
            onClick={() => handleTileClick('settings')}
            className="group bg-[#7081df] hover:bg-[#6273d6] active:bg-[#5667ca] active:scale-[0.99] rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center shadow-xs hover:shadow-md transition-all cursor-pointer h-full w-full focus:outline-none relative overflow-hidden"
          >
            <span className="absolute top-2 right-2 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
              LAN Ready
            </span>

            <div className="mb-1 sm:mb-2 group-hover:scale-105 transition-transform">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="4">
                <circle cx="32" cy="32" r="8" fill="white" stroke="none" />
                <circle cx="32" cy="32" r="14" strokeWidth="3" />
                <circle cx="32" cy="32" r="22" strokeWidth="3" strokeDasharray="6 4" />
                <path d="M32 4v7M32 53v7M4 32h7M53 32h7M12 12l5 5M47 47l5 5M12 52l5-5M47 17l5-5" strokeWidth="4.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm sm:text-base lg:text-lg font-black tracking-wide text-white text-center leading-tight">
              System Settings
            </span>
            <span className="text-[10px] sm:text-xs text-blue-100 mt-0.5 truncate max-w-[90%]">
              Printers 1 & 2, Drawer & Sync
            </span>
          </button>

          {/* 9. Lock / Logout */}
          <button
            type="button"
            onClick={() => handleTileClick('logout')}
            className="group bg-[#7081df] hover:bg-[#6273d6] active:bg-[#5667ca] active:scale-[0.99] rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center shadow-xs hover:shadow-md transition-all cursor-pointer h-full w-full focus:outline-none relative overflow-hidden"
          >
            <span className="absolute top-2 right-2 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
              Secure
            </span>

            <div className="mb-1 sm:mb-2 group-hover:scale-105 transition-transform">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="5">
                <path d="M19 22a18 18 0 1 0 26 0" strokeLinecap="round" />
                <path d="M32 10v22M24 18l8-8 8 8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm sm:text-base lg:text-lg font-black tracking-wide text-white text-center leading-tight">
              Lock / Logout
            </span>
            <span className="text-[10px] sm:text-xs text-blue-100 mt-0.5 truncate max-w-[90%]">
              Switch User & End Shift
            </span>
          </button>

        </div>
      </main>

      {/* 3. Fixed Footer */}
      <footer className="h-6 sm:h-7 shrink-0 text-center text-[10px] sm:text-xs text-slate-400 flex items-center justify-center space-x-2 sm:space-x-3 pt-1 border-t border-slate-200/60">
        <span>Shalom Food POS System</span>
        <span>•</span>
        <span>Terminal #01 (Cashier Station)</span>
        <span>•</span>
        <span className="text-emerald-600 font-semibold">Local LAN: 192.168.1.50</span>
      </footer>

      {/* ----------------- MODALS ----------------- */}

      {/* 1. Return & Refund Settlement Modal */}
      <Modal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        title="Order Return & Refund Settlement"
        subtitle="Look up completed order by Order Number to process void/refund"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Search Order Number (e.g. ORD-1048, ORD-1047, ORD-1046)
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="ORD-..."
                value={refundOrderQuery}
                onChange={(e) => setRefundOrderQuery(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono uppercase"
              />
              <button
                type="button"
                onClick={() => {
                  const found = orders.find(
                    (o) => o.orderNumber.toLowerCase() === refundOrderQuery.toLowerCase().trim()
                  );
                  if (found) {
                    setSelectedRefundOrder(found);
                  } else {
                    addNotification({
                      title: 'Order Not Found',
                      message: `No record matching ${refundOrderQuery}`,
                      type: 'warning',
                    });
                  }
                }}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Find Order
              </button>
            </div>
          </div>

          {selectedRefundOrder && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
              <div className="flex justify-between items-start pb-2 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-900">{selectedRefundOrder.orderNumber}</h4>
                  <p className="text-slate-500">{selectedRefundOrder.customerName || 'Counter Guest'}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-rose-600">
                    Rs. {selectedRefundOrder.total.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block uppercase">
                    Paid via {selectedRefundOrder.paymentMethod || 'Cash'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Refund Reason</label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-medium"
                >
                  <option value="Customer Change of Mind">Customer Change of Mind</option>
                  <option value="Incorrect Food Item Delivered">Incorrect Food Item Delivered</option>
                  <option value="Food Quality / Temperature Issue">Food Quality / Temperature Issue</option>
                  <option value="Excessive Waiting Time">Excessive Waiting Time</option>
                  <option value="Cashier Billing Error">Cashier Billing Error</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleProcessRefund}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  Authorize & Issue Full Refund (Rs. {selectedRefundOrder.total.toLocaleString()})
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* 3. Employee & Staff Roster Modal */}
      <Modal
        isOpen={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        title="Restaurant Staff & Cashier Roster"
        subtitle="Manage logged-in cashier sessions and permissions"
        maxWidth="md"
      >
        <div className="space-y-3">
          <div className="divide-y divide-slate-100">
            {users.map((u) => (
              <div key={u.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <img src={u.avatar} alt="" className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200" />
                  <div>
                    <h4 className="font-bold text-slate-800">{u.name}</h4>
                    <span className="text-[10px] uppercase font-bold text-slate-400">{u.role}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {currentUser.id === u.id ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                      Active User
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playTap();
                        setCurrentUser(u);
                        setShowEmployeeModal(false);
                        addNotification({
                          title: 'User Switched',
                          message: `Switched active cashier to ${u.name} (${u.role.toUpperCase()})`,
                          type: 'info',
                        });
                      }}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                    >
                      Switch To
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setShowEmployeeModal(false);
                navigate('/settings');
              }}
              className="text-xs text-blue-600 hover:underline font-bold"
            >
              Open Full User Settings & PIN Management →
            </button>
          </div>
        </div>
      </Modal>

      {/* 4. Logout / Lock Screen Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Lock POS Terminal / Switch Cashier"
        subtitle="Secure the cashier station or end current shift"
        maxWidth="sm"
      >
        <div className="flex flex-col items-center text-center space-y-4 py-2">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
            <Lock className="w-7 h-7 text-slate-700" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800">Current Session: {currentUser.name}</h4>
            <p className="text-xs text-slate-500 mt-0.5">Terminal #01 • Cashier Register Ready</p>
          </div>
          <div className="flex items-center space-x-2 w-full pt-2">
            <button
              type="button"
              onClick={() => setShowLogoutModal(false)}
              className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
            >
              Resume Session
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playSuccess();
                setShowLogoutModal(false);
                addNotification({
                  title: 'Terminal Locked',
                  message: 'Enter 4-digit PIN to resume cashier session.',
                  type: 'info',
                });
              }}
              className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold"
            >
              Lock Terminal
            </button>
          </div>
        </div>
      </Modal>

      {/* 5. Software Info Modal (Pink (i) Button) */}
      <Modal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="Shalom Food POS System 2.0"
        subtitle="Commercial Touchscreen Restaurant Terminal"
        maxWidth="md"
      >
        <div className="space-y-3 text-xs text-slate-600">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="font-bold text-blue-900">Shalom Food Restaurant • Colombo Flagship</p>
            <p className="text-[11px] text-blue-700 mt-0.5">
              Enterprise Commercial Multi-Terminal Edition
            </p>
          </div>

          <div className="space-y-1.5 divide-y divide-slate-100">
            <div className="flex justify-between py-1.5">
              <span>Software Version</span>
              <span className="font-bold text-slate-900">v2.0.4 Commercial</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span>Local Server Status</span>
              <span className="font-bold text-emerald-600">Connected (192.168.1.50)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span>Customer Receipt Printer</span>
              <span className="font-mono text-slate-800">{settings.printers.customerBill.ipAddress}:9100</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span>Kitchen 1 Hot Line (LAN)</span>
              <span className="font-mono text-slate-800">{settings.printers.kitchen1.ipAddress}:9100</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span>Kitchen 2 Cold Bar (LAN)</span>
              <span className="font-mono text-slate-800">{settings.printers.kitchen2.ipAddress}:9100</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span>Cash Drawer Solenoid</span>
              <span className="font-bold text-slate-900">RJ11 Kick Pulse (120ms)</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setShowInfoModal(false)}
              className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
