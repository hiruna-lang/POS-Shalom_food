import { Link } from 'react-router-dom';
import { ArrowUpRight, ChefHat, CircleDollarSign, ClipboardList, ShoppingCart } from 'lucide-react';
import { usePos } from '../context/PosContext';
import { formatLkr, isPaidSale } from '../utils/billing';

export function DashboardPage() {
  const { orders, currentUser, currentTime, settings } = usePos();
  const dateKey = (date: Date) => date.toLocaleDateString('sv-SE', { timeZone: 'Asia/Colombo' });
  const todaysOrders = orders.filter((order) => dateKey(new Date(order.createdAt)) === dateKey(currentTime));
  const sales = todaysOrders.filter(isPaidSale);
  const kitchen = orders.filter((order) => ['pending', 'in_kitchen'].includes(order.orderStatus));
  const metrics = [
    { label: 'Sales today', value: formatLkr(sales.reduce((sum, order) => sum + order.total, 0)), icon: CircleDollarSign },
    { label: 'Paid orders today', value: sales.length, icon: ClipboardList },
    { label: 'Active kitchen orders', value: kitchen.length, icon: ChefHat },
  ];

  return (
    <div className="module-page">
      <header className="module-heading">
        <div><h1>Dashboard</h1><p>{currentUser.name} / {settings.general.branchName}</p></div>
        <Link className="primary-action" to="/pos"><ShoppingCart size={19} /> Open billing <ArrowUpRight size={16} /></Link>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div className="surface p-4" key={label}>
            <Icon size={19} className="mb-3 text-blue-700" />
            <p className="text-sm text-slate-600">{label}</p>
            <strong className="text-2xl tabular-nums">{value}</strong>
          </div>
        ))}
      </div>
      <section className="surface mt-4 p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">Recent orders</h2>
          <Link to="/orders" className="secondary-action">View orders <ArrowUpRight size={15} /></Link>
        </div>
        {orders.length === 0 && <p className="py-4 text-slate-600">No orders yet.</p>}
        {orders.slice(0, 6).map((order) => (
          <div key={order.id} className="grid grid-cols-2 gap-1 border-t border-slate-100 py-3 text-sm sm:grid-cols-3">
            <strong>{order.orderNumber}</strong>
            <span className="capitalize text-slate-600">{order.orderStatus.replace(/_/g, ' ')}</span>
            <span className="tabular-nums sm:text-right">{formatLkr(order.total)}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
