import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  CreditCard,
  Banknote,
  QrCode,
  ArrowUpRight,
  PieChart,
  ShoppingBag,
  Award,
  AlertCircle
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { orders, menuItems, addNotification, settings } = usePos();

  const [dateRange, setDateRange] = useState<'today' | 'weekly' | 'monthly' | 'custom'>('today');
  const [customStart, setCustomStart] = useState('2026-11-01');
  const [customEnd, setCustomEnd] = useState('2026-11-11');

  // Multiplier simulation for weekly / monthly demo
  const rangeMultiplier = dateRange === 'today' ? 1 : dateRange === 'weekly' ? 6.8 : dateRange === 'monthly' ? 28.5 : 10.2;

  const validOrders = orders.filter((o) => o.orderStatus !== 'cancelled');
  const cancelledOrders = orders.filter((o) => o.orderStatus === 'cancelled');

  // Baseline calculations
  const baseRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
  const totalRevenue = Math.round(baseRevenue * rangeMultiplier);
  const totalOrders = Math.round(validOrders.length * rangeMultiplier);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const totalCancelledCount = Math.round(cancelledOrders.length * rangeMultiplier);
  const cancelledLoss = Math.round(cancelledOrders.reduce((sum, o) => sum + o.total, 0) * rangeMultiplier);

  // Payment Breakdown
  const cashTotal = Math.round(totalRevenue * 0.58);
  const cardTotal = Math.round(totalRevenue * 0.34);
  const qrTotal = Math.round(totalRevenue * 0.08);

  // Best Selling Items computation
  const bestSellers = [
    { name: 'Shalom Special Dum Biryani', category: 'Biryani & Rice', count: Math.round(48 * rangeMultiplier), price: 1850 },
    { name: 'Chicken Cheese Kottu Roti', category: 'Kottu Specialties', count: Math.round(36 * rangeMultiplier), price: 1650 },
    { name: 'Fresh Passion Fruit Mojito', category: 'Cold & Hot Drinks', count: Math.round(31 * rangeMultiplier), price: 650 },
    { name: 'Crispy Hot Butter Cuttlefish', category: 'Appetizers & Bites', count: Math.round(24 * rangeMultiplier), price: 2100 },
    { name: 'Shalom Double Crispy Burger', category: 'Burgers & Wraps', count: Math.round(19 * rangeMultiplier), price: 1550 },
    { name: 'Caramelized Watalappam', category: 'Desserts & Sweets', count: Math.round(18 * rangeMultiplier), price: 750 },
  ];

  // Simulated Hourly Sales Data for Chart
  const hourlyData = [
    { hour: '11 AM', sales: 18500 * (rangeMultiplier / 4) },
    { hour: '12 PM', sales: 46200 * (rangeMultiplier / 4) },
    { hour: '01 PM', sales: 68400 * (rangeMultiplier / 4) },
    { hour: '02 PM', sales: 38900 * (rangeMultiplier / 4) },
    { hour: '04 PM', sales: 21000 * (rangeMultiplier / 4) },
    { hour: '06 PM', sales: 49500 * (rangeMultiplier / 4) },
    { hour: '07 PM', sales: 82000 * (rangeMultiplier / 4) },
    { hour: '08 PM', sales: 94500 * (rangeMultiplier / 4) },
    { hour: '09 PM', sales: 52000 * (rangeMultiplier / 4) },
  ];

  const maxHourly = Math.max(...hourlyData.map((d) => d.sales));

  // Category Breakdown Data
  const categorySales = [
    { category: 'Biryani & Rice', share: 42, color: 'bg-blue-600' },
    { category: 'Kottu Specialties', share: 24, color: 'bg-amber-500' },
    { category: 'Mains & Curries', share: 14, color: 'bg-indigo-500' },
    { category: 'Drinks & Desserts', share: 12, color: 'bg-cyan-500' },
    { category: 'Burgers & Appetizers', share: 8, color: 'bg-emerald-500' },
  ];

  // Excel Export Handler (Generates CSV download)
  const handleExportExcel = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        ['Shalom Food Restaurant - Sales Performance Report'],
        ['Period', dateRange.toUpperCase()],
        ['Generated On', new Date().toLocaleString()],
        [],
        ['Metric', 'Value'],
        ['Total Revenue (LKR)', totalRevenue],
        ['Total Orders', totalOrders],
        ['Average Order Value (LKR)', avgOrderValue],
        ['Cash Settlement (LKR)', cashTotal],
        ['Card Settlement (LKR)', cardTotal],
        ['QR / Digital (LKR)', qrTotal],
        ['Cancelled Orders', totalCancelledCount],
        ['Cancelled Loss (LKR)', cancelledLoss],
        [],
        ['Top Dish', 'Category', 'Quantity Sold', 'Gross Revenue (LKR)'],
        ...bestSellers.map((b) => [b.name, b.category, b.count, b.count * b.price]),
      ]
        .map((e) => e.join(','))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Shalom_Sales_Report_${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    addNotification({
      title: 'Excel Report Exported',
      message: 'Sales CSV summary file generated and downloaded.',
      type: 'success',
    });
  };

  // PDF Export Handler
  const handleExportPdf = () => {
    window.print();
    addNotification({
      title: 'PDF Report Ready',
      message: 'Print dialogue opened for saving high-resolution PDF.',
      type: 'info',
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto select-none">
      {/* 1. Header & Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Business Analytics & Sales Reports
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Revenue tracking, category performance breakdown, and top-performing dishes.
          </p>
        </div>

        {/* Date Filter Buttons & Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-white p-1 rounded-2xl border border-slate-200/90 shadow-xs flex items-center space-x-1">
            {[
              { id: 'today', label: 'Today' },
              { id: 'weekly', label: 'This Week' },
              { id: 'monthly', label: 'This Month' },
              { id: 'custom', label: 'Custom' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setDateRange(p.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  dateRange === p.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel Export</span>
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>PDF Export</span>
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {dateRange === 'custom' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3 text-xs">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-slate-700">From:</span>
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono"
          />
          <span className="font-bold text-slate-700">To:</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono"
          />
        </div>
      )}

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-blue-100">
            <span className="text-xs font-bold uppercase tracking-wider">Total Gross Revenue</span>
            <DollarSign className="w-5 h-5 text-blue-200" />
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-3">
            Rs. {totalRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-blue-100 mt-2 flex items-center">
            <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
            +18.5% compared to previous period
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              {totalOrders}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Orders processed across all terminals</p>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Order Value (AOV)</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Rs. {avgOrderValue.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Average customer spending per ticket</p>
          </div>
        </div>

        {/* Cancelled Orders */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              Cancelled / Voided
            </span>
            <AlertCircle className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 mt-2">
              {totalCancelledCount}
            </div>
            <p className="text-[11px] text-rose-500 mt-1 font-semibold">
              Lost value: Rs. {cancelledLoss.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Charts Section: Hourly Peak Sales & Category Share */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-sm text-slate-900">Peak Hours & Sales Trend</h4>
              <p className="text-xs text-slate-400">Hourly revenue distribution throughout the shift</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              Peak: 8:00 PM
            </span>
          </div>

          {/* Bar Chart Representation */}
          <div className="mt-6 flex items-end justify-between gap-2 h-52 pt-6">
            {hourlyData.map((d, idx) => {
              const heightPct = Math.round((d.sales / maxHourly) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md pointer-events-none whitespace-nowrap z-10">
                    Rs. {Math.round(d.sales).toLocaleString()}
                  </div>

                  <div className="w-full bg-slate-100 rounded-t-lg h-full flex items-end">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-gradient-to-t from-blue-700 to-blue-500 rounded-t-lg group-hover:from-blue-600 group-hover:to-indigo-400 transition-all shadow-xs"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 mt-2 text-center">
                    {d.hour}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Performance Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">Category Share (%)</h4>
              <p className="text-xs text-slate-400">Sales volume by food & drink category</p>
            </div>

            <div className="space-y-4 mt-6">
              {categorySales.map((cat, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">{cat.category}</span>
                    <span className="text-slate-900 font-bold">{cat.share}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${cat.share}%` }}
                      className={`h-full rounded-full ${cat.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Distribution */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Payment Method Mix
            </h5>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <Banknote className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="font-extrabold text-slate-800">58%</span>
                <span className="text-[10px] text-slate-400 block">Cash</span>
              </div>
              <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                <CreditCard className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span className="font-extrabold text-slate-800">34%</span>
                <span className="text-[10px] text-slate-400 block">Card</span>
              </div>
              <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100">
                <QrCode className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                <span className="font-extrabold text-slate-800">8%</span>
                <span className="text-[10px] text-slate-400 block">LankaQR</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Best Selling Items Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h4 className="font-bold text-sm text-slate-900">
              Best Selling Dishes & Menu Performance
            </h4>
          </div>
          <span className="text-xs font-bold text-slate-400">Ranked by volume sold</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Dish Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Unit Price (LKR)</th>
                <th className="py-3 px-4">Units Sold</th>
                <th className="py-3 px-4">Gross Revenue (LKR)</th>
                <th className="py-3 px-4">Sales Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {bestSellers.map((item, idx) => {
                const itemRevenue = item.count * item.price;
                const sharePct = Math.round((itemRevenue / totalRevenue) * 100);

                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <span
                        className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black ${
                          idx === 0
                            ? 'bg-amber-100 text-amber-800'
                            : idx === 1
                            ? 'bg-slate-200 text-slate-800'
                            : idx === 2
                            ? 'bg-amber-50 text-amber-700'
                            : 'text-slate-400'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600">{item.category}</td>
                    <td className="py-3.5 px-4 font-mono">Rs. {item.price.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-extrabold text-blue-700">{item.count} orders</td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      Rs. {itemRevenue.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800">{sharePct}%</span>
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${Math.min(100, sharePct * 3)}%` }}
                            className="h-full bg-blue-600 rounded-full"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

