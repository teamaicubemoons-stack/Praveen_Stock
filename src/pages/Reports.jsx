import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, ArrowUpRight } from 'lucide-react';
import useStore from '../store/useStore';
import { formatCurrency, STATUS_COLORS } from '../lib/utils';

const MONTHLY_SALES = [
  { month: 'Jan', revenue: 142000, orders: 38, returns: 3 },
  { month: 'Feb', revenue: 168000, orders: 44, returns: 5 },
  { month: 'Mar', revenue: 195000, orders: 52, returns: 4 },
  { month: 'Apr', revenue: 178000, orders: 47, returns: 6 },
  { month: 'May', revenue: 221000, orders: 61, returns: 2 },
  { month: 'Jun', revenue: 198000, orders: 54, returns: 4 },
];

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm shadow-card">
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {p.name === 'revenue' ? formatCurrency(p.value) : `${p.value} ${p.name}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Reports() {
  const { products, orders, returns } = useStore();

  const totalRevenue   = orders.filter(o => o.status === 'dispatched').reduce((s, o) => s + o.total, 0);
  const totalOrders    = orders.length;
  const totalReturns   = returns.length;
  const returnRate     = totalOrders > 0 ? ((totalReturns / totalOrders) * 100).toFixed(1) : 0;
  const avgOrderValue  = totalOrders > 0 ? (totalRevenue / Math.max(orders.filter(o=>o.status==='dispatched').length,1)) : 0;

  const categoryStock = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + p.totalStock;
    return acc;
  }, {});
  const categoryData = Object.entries(categoryStock).map(([name, value]) => ({ name, value }));

  const topProducts = [...products].sort((a, b) => b.totalStock - a.totalStock).slice(0, 5);
  const lowStockProducts = products.filter(p => p.totalStock < 50);

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="page-title">Reports & Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Business performance overview and key metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', change: '+14.2%' },
          { label: 'Total Orders',  value: totalOrders, icon: ArrowUpRight, color: 'text-brand-600', bg: 'bg-brand-50', change: '+8.5%' },
          { label: 'Avg Order Value', value: formatCurrency(avgOrderValue), icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', change: '+5.1%' },
          { label: 'Return Rate',   value: `${returnRate}%`, icon: TrendingDown, color: 'text-amber-600', bg: 'bg-amber-50', change: '-2.3%' },
        ].map((kpi) => (
          <motion.div key={kpi.label} whileHover={{ y: -2 }} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
              <kpi.icon size={18} className={kpi.color} />
            </div>
            <p className="text-xl font-bold text-slate-900">{kpi.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
            <p className="text-xs text-green-600 mt-1 font-medium">{kpi.change} vs last month</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue + Orders charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="section-card">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Revenue Trend</h2>
          <p className="text-xs text-slate-500 mb-4">Monthly revenue — 2026</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY_SALES}>
              <defs>
                <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revGrad2)" dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="section-card">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Orders vs Returns</h2>
          <p className="text-xs text-slate-500 mb-4">Monthly comparison</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY_SALES} barGap={4} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders"  name="orders"  fill="#6366f1" radius={[4,4,0,0]} />
              <Bar dataKey="returns" name="returns" fill="#f87171" radius={[4,4,0,0]} />
              <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-slate-500 text-xs capitalize">{v}</span>} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution + Top Products */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="section-card">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Stock by Category</h2>
          <p className="text-xs text-slate-500 mb-4">Inventory distribution</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v} units`, '']} contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, color: '#1e293b', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
              <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-slate-500 text-xs">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="xl:col-span-2 section-card">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Top Products by Stock</h2>
          <div className="space-y-3">
            {topProducts.map((p, i) => {
              const maxStock = topProducts[0]?.totalStock || 1;
              const pct = (p.totalStock / maxStock) * 100;
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-5 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                      <span className="text-sm font-bold text-slate-900 ml-2">{p.totalStock}</span>
                    </div>
                    <div className="bg-slate-100 rounded-full h-1.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="h-1.5 rounded-full"
                        style={{ background: PIE_COLORS[i] }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 w-12 text-right">{p.category}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="section-card border border-red-100 bg-red-50/30">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-red-600" />
            <h2 className="text-base font-semibold text-slate-900">Low Stock Alerts</h2>
            <span className="ml-auto text-xs text-red-600 font-medium">{lowStockProducts.length} products</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-red-100 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">{p.totalStock}</p>
                  <p className="text-xs text-slate-400">units</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
