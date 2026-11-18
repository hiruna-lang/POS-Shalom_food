import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Utensils, ChefHat, ClipboardList, ChartNoAxesColumn, Users, Settings, Lock, PanelLeft } from 'lucide-react';
import { usePos } from '../../context/PosContext';

export function Sidebar() {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const { currentUser, logout } = usePos();
  const management = currentUser.role !== 'cashier';
  const admin = currentUser.role === 'admin';
  const items = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, visible: true },
    { to: '/pos', label: 'POS / Billing', icon: ShoppingCart, visible: true },
    { to: '/menu', label: 'Menu Management', icon: Utensils, visible: management },
    { to: '/orders?view=kds', label: 'Kitchen Display', icon: ChefHat, visible: true },
    { to: '/orders', label: 'Orders', icon: ClipboardList, visible: true },
    { to: '/reports', label: 'Reports & Sales', icon: ChartNoAxesColumn, visible: management },
    { to: '/staff', label: 'Staff & Cashiers', icon: Users, visible: admin },
    { to: '/settings', label: 'System Settings', icon: Settings, visible: admin },
  ];

  return (
    <nav className="workspace-nav" data-expanded={expanded} aria-label="Main navigation">
      <button type="button" className="nav-toggle" title="Toggle sidebar" aria-label="Toggle sidebar" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
        <PanelLeft size={20} /><span>Navigation</span>
      </button>
      {items.filter((item) => item.visible).map(({ to, icon: Icon, label }) => (
        <Link key={to} to={to} data-active={to === location.pathname + (location.search === '?view=kds' ? location.search : '')} aria-current={to === location.pathname + (location.search === '?view=kds' ? location.search : '') ? 'page' : undefined} title={label} aria-label={label} onClick={() => setExpanded(false)}>
          <Icon size={20} /><span>{label}</span>
        </Link>
      ))}
      <button type="button" className="nav-lock" title="Lock POS" aria-label="Lock POS" onClick={logout}>
        <Lock size={20} /><span>Lock POS</span>
      </button>
    </nav>
  );
}
