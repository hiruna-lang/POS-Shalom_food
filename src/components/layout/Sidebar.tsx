import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  Utensils,
  Package,
  BarChart3,
  Settings,
  HelpCircle
} from 'lucide-react';
import { usePos } from '../../context/PosContext';

export const Sidebar: React.FC = () => {
  const { cart, orders, inventory } = usePos();

  const pendingOrdersCount = orders.filter(
    (o) => o.orderStatus === 'pending' || o.orderStatus === 'in_kitchen'
  ).length;

  const lowStockCount = inventory.filter(
    (i) => i.currentStock <= i.minStockLevel
  ).length;

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/pos',
      label: 'POS / Billing',
      icon: ShoppingCart,
      badge: cart.length > 0 ? `${cart.length}` : null,
      badgeColor: 'bg-blue-500 text-white',
    },
    {
      to: '/orders',
      label: 'Orders',
      icon: ClipboardList,
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      to: '/menu',
      label: 'Menu Management',
      icon: Utensils,
      badge: null,
    },
    {
      to: '/inventory',
      label: 'Inventory',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount}` : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      to: '/reports',
      label: 'Reports',
      icon: BarChart3,
      badge: null,
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-20 md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none shadow-lg">
      <div className="py-4 px-2 md:px-3 space-y-1.5">
        <div className="hidden md:block px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Main Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-3 rounded-xl font-medium transition-all group relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`
              }
            >
              <div className="flex items-center space-x-3 w-full justify-center md:justify-start">
                <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                <span className="hidden md:inline-block text-sm tracking-wide">
                  {item.label}
                </span>
              </div>

              {/* Badges */}
              {item.badge && (
                <span
                  className={`hidden md:inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full ${
                    item.badgeColor || 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Mobile badge indicator */}
              {item.badge && (
                <span className="md:hidden absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-slate-900" />
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom helper card / quick info */}
      <div className="p-3 border-t border-slate-800/80">
        <div className="hidden md:block bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Terminal #01</span>
            <span className="text-emerald-400 font-semibold">Online</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Cashier Station • LAN Ready
          </div>
        </div>

        <div className="md:hidden flex justify-center py-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>
    </aside>
  );
};

