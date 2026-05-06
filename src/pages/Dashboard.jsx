import { motion } from 'framer-motion';
import {
  TrendingUp, Package, AlertTriangle, ShoppingCart,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle2,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import useStore from '../store/useStore';
import { formatCurrency, formatDate, STATUS_COLORS } from '../lib/utils';

const SALES_DATA = [
  { month: 'Jan', revenue: 142000, orders: 38 },
  { month: 'Feb', revenue: 168000, orders: 44 },
  { month: 'Mar', revenue: 195000, orders: 52 },
  { month: 'Apr', revenue: 178000, orders: 47 },
  { month: 'May', revenue: 221000, orders: 61 },
  { month: 'Jun', revenue: 198000, orders: 54 },
];

const PIE_COLORS = ['#4f46e5', '#7c3aed', '#9333ea', '#c084fc', '#e879f9'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-card">
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name === 'revenue' ? formatCurrency(p.value) : `${p.value} orders`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function StatCard({ label, value, icon: Icon, color, change, changeLabel }) {
  const isPositive = change >= 0;
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}
      className="stat-card border-none ring-1 ring-slate-100"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} shadow-lg shadow-current/20`}>
          <Icon size={22} className="text-white" />
        </div>
        <div className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {Math.abs(change)}%
        </div>
      </div>
      <div>
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
        <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-medium italic">
          <TrendingUp size={10} className="text-slate-300" /> {changeLabel}
        </p>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { products, orders, inwardStock } = useStore();

  const totalStock  = products.reduce((s, p) => s + p.totalStock, 0);
  const lowStock    = products.filter((p) => p.totalStock < 50).length;
  const pendingOrds = orders.filter((o) => ['pending','confirmed'].includes(o.status)).length;
  const totalRevenue = orders.filter(o => o.status === 'dispatched').reduce((s, o) => s + o.total, 0);

  const inventoryPieData = products.map((p) => ({
    name: p.name, value: p.totalStock,
  }));

  const recentOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back — here's your business at a glance</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
          <Clock size={14} className="text-brand-600" />
          <span className="text-xs text-slate-500 font-medium">{formatDate(new Date().toISOString())}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Products"  value={products.length}       icon={Package}       color="bg-brand-600"    change={12}  changeLabel="vs last month" />
        <StatCard label="Total Stock"     value={totalStock.toLocaleString()} icon={TrendingUp} color="bg-purple-600" change={8.4} changeLabel="units in warehouse" />
        <StatCard label="Low Stock Items" value={lowStock}               icon={AlertTriangle} color="bg-red-500"      change={-2}  changeLabel="need reorder" />
        <StatCard label="Pending Orders"  value={pendingOrds}            icon={ShoppingCart}  color="bg-amber-500"    change={15}  changeLabel="awaiting dispatch" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 section-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Revenue Overview</h2>
              <p className="text-xs text-slate-500 mt-0.5">Monthly sales performance — 2026</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-green-600 flex items-center justify-end gap-1 font-medium">
                <ArrowUpRight size={11} /> 14.2% from last period
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={SALES_DATA}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Inventory Distribution */}
        <div className="section-card">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Stock Distribution</h2>
          <p className="text-xs text-slate-500 mb-6">By product category</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={inventoryPieData}
                cx="50%" cy="50%"
                innerRadius={50} outerRadius={75}
                paddingAngle={5}
                dataKey="value"
              >
                {inventoryPieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} units`, '']} contentStyle={{ background: '#ffffff', border: 'none', borderRadius: 12, color: '#1e293b', fontSize: 13, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
              <Legend iconType="circle" iconSize={10} verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} formatter={(v) => <span className="text-slate-600 text-xs font-bold uppercase tracking-tight">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders Chart + Recent Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Orders bar */}
        <div className="section-card">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Monthly Orders</h2>
          <p className="text-xs text-slate-500 mb-4">Order volume trend</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={SALES_DATA} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" name="orders" fill="#8b5cf6" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Orders Table */}
        <div className="xl:col-span-2 section-card overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">Recent Orders</h2>
            <a href="/orders" className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 transition-colors">
              View all <ArrowUpRight size={12} />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-head text-left">Order ID</th>
                  <th className="table-head text-left">Customer</th>
                  <th className="table-head text-left">Date</th>
                  <th className="table-head text-right">Amount</th>
                  <th className="table-head text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="table-cell font-mono text-brand-600 text-xs">{order.id}</td>
                    <td className="table-cell font-medium text-slate-800">{order.customerName}</td>
                    <td className="table-cell text-slate-500 text-xs">{formatDate(order.date)}</td>
                    <td className="table-cell text-right font-semibold text-slate-900">{formatCurrency(order.total)}</td>
                    <td className="table-cell text-center">
                      <span className={`status-badge ${STATUS_COLORS[order.status]}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStock > 0 && (
        <div className="section-card border border-red-100 bg-red-50/30">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={18} className="text-red-600" />
            <h2 className="text-base font-semibold text-slate-900">Low Stock Alerts</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.filter(p => p.totalStock < 50).map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-red-100 shadow-sm">
                <div>
                  <p className="text-sm font-medium text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">{p.totalStock}</p>
                  <p className="text-xs text-slate-400">units left</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
