import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Trash2, Search, ChevronDown, ShoppingCart,
  CheckCircle2, XCircle, Clock, Eye,
} from 'lucide-react';
import useStore from '../store/useStore';
import { formatCurrency, formatDate, STATUS_COLORS } from '../lib/utils';

function CreateOrderModal({ onClose }) {
  const { products, addOrder } = useStore();
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [items, setItems] = useState([{ productId: '', variantId: '', qty: 1 }]);
  const [discount, setDiscount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [success, setSuccess] = useState(false);

  const addItem = () => setItems((i) => [...i, { productId: '', variantId: '', qty: 1 }]);
  const removeItem = (i) => setItems((it) => it.filter((_, idx) => idx !== i));

  const updateItem = (i, field, value) =>
    setItems((it) => it.map((item, idx) => {
      if (idx !== i) return item;
      const updated = { ...item, [field]: value };
      if (field === 'productId') updated.variantId = '';
      return updated;
    }));

  const buildOrderItems = () =>
    items.map((item) => {
      const prod    = products.find((p) => p.id === item.productId);
      const variant = prod?.variants.find((v) => v.id === item.variantId);
      if (!prod || !variant) return null;
      return {
        productId:   prod.id,
        productName: prod.name,
        sku:         prod.sku,
        size:        variant.size,
        color:       variant.color,
        qty:         Number(item.qty),
        mrp:         prod.mrp,
        total:       prod.mrp * Number(item.qty),
      };
    }).filter(Boolean);

  const orderItems = buildOrderItems();
  const subtotal   = orderItems.reduce((s, i) => s + i.total, 0);
  const total      = subtotal - Number(discount);

  const handleSave = () => {
    if (!customer.name || orderItems.length === 0) return;
    addOrder({
      customerName:    customer.name,
      customerPhone:   customer.phone,
      shippingAddress: customer.address,
      items:           orderItems,
      subtotal, discount: Number(discount), total,
      paymentStatus,
    });
    setSuccess(true);
    setTimeout(onClose, 1200);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="modal-content"
        style={{ maxWidth: 640 }}
      >
        <h2 className="text-lg font-bold text-slate-900 mb-6">Create New Order</h2>

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-sm text-green-400 mb-4">
            Order created successfully!
          </div>
        )}

        <div className="space-y-4">
          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Customer Name *</label>
              <input value={customer.name} onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))} className="input-field" placeholder="e.g. Sharma Garments" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input value={customer.phone} onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))} className="input-field" placeholder="+91 98..." />
            </div>
            <div>
              <label className="label">Payment Status</label>
              <div className="relative">
                <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="input-field appearance-none pr-8">
                  {['pending','paid','partial'].map((s) => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
            <div className="col-span-2">
              <label className="label">Shipping Address</label>
              <input value={customer.address} onChange={(e) => setCustomer((c) => ({ ...c, address: e.target.value }))} className="input-field" placeholder="Full address" />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Order Items *</label>
              <button onClick={addItem} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"><Plus size={12} /> Add</button>
            </div>
            {items.map((item, i) => {
              const prod = products.find((p) => p.id === item.productId);
              return (
                <div key={i} className="grid grid-cols-5 gap-2 mb-2">
                  <div className="col-span-2">
                    <select value={item.productId} onChange={(e) => updateItem(i, 'productId', e.target.value)} className="input-field appearance-none text-xs">
                      <option value="">-- Product --</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <select value={item.variantId} onChange={(e) => updateItem(i, 'variantId', e.target.value)} className="input-field appearance-none text-xs" disabled={!prod}>
                      <option value="">-- Variant --</option>
                      {prod?.variants.map((v) => <option key={v.id} value={v.id}>{v.size}/{v.color} ({v.qty})</option>)}
                    </select>
                  </div>
                  <div className="flex gap-1">
                    <input type="number" min={1} value={item.qty} onChange={(e) => updateItem(i, 'qty', e.target.value)} className="input-field" placeholder="Qty" />
                    {items.length > 1 && (
                      <button onClick={() => removeItem(i)} className="p-2 text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          {orderItems.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
              {orderItems.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-500">{item.productName} {item.size}/{item.color} ×{item.qty}</span>
                  <span className="text-slate-900 font-medium">{formatCurrency(item.total)}</span>
                </div>
              ))}
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-900 font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-500 w-20">Discount</label>
                <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className="input-field w-32 text-sm" placeholder="0" />
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-slate-200">
                <span className="text-slate-900">Total</span>
                <span className="text-brand-600 text-lg">{formatCurrency(total)}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="btn-primary flex-1 justify-center">
              <ShoppingCart size={15} /> Create Order
            </button>
            <button onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Orders() {
  const { orders } = useStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q);
    const matchStatus = filter ? o.status === filter : true;
    return matchSearch && matchStatus;
  }).sort((a,b) => new Date(b.date) - new Date(a.date));

  const statusIcon = (s) => ({
    pending: <Clock size={12} />, confirmed: <CheckCircle2 size={12} />,
    packed: <CheckCircle2 size={12} />, dispatched: <CheckCircle2 size={12} />,
    partial: <XCircle size={12} />,
  }[s] || <Clock size={12} />);

  return (
    <div className="space-y-6 page-enter">
      {showModal && <CreateOrderModal onClose={() => setShowModal(false)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Order Management</h1>
          <p className="text-slate-500 text-sm mt-1">Create and manage customer orders</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} /> New Order
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          ['Total Orders', orders.length, 'bg-brand-600', 'text-brand-700', 'bg-brand-50'],
          ['Pending', orders.filter(o => o.status === 'pending').length, 'bg-amber-500', 'text-amber-700', 'bg-amber-50'],
          ['Confirmed', orders.filter(o => o.status === 'confirmed').length, 'bg-blue-500', 'text-blue-700', 'bg-blue-50'],
          ['Dispatched', orders.filter(o => o.status === 'dispatched').length, 'bg-emerald-600', 'text-emerald-700', 'bg-emerald-50'],
        ].map(([label, count, color, textColor, bgColor]) => (
          <div key={label} className={`stat-card flex items-center justify-between shadow-sm border-slate-100/50 ${bgColor}`}>
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
              <p className={`text-2xl font-black ${textColor}`}>{count}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white shadow-lg shadow-current/10`}>
              <ShoppingCart size={18} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID or customer..." className="input-field pl-9" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field w-36 text-xs">
          <option value="">All Status</option>
          {['pending','confirmed','packed','dispatched','partial'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Orders Table */}
      <div className="section-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="table-head text-left">Order ID</th>
                <th className="table-head text-left">Customer</th>
                <th className="table-head text-left">Date</th>
                <th className="table-head text-center">Items</th>
                <th className="table-head text-right">Amount</th>
                <th className="table-head text-center">Payment</th>
                <th className="table-head text-center">Status</th>
                <th className="table-head text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((order) => (
                <motion.tr key={order.id} layout className="hover:bg-slate-50/50 transition-colors">
                  <td className="table-cell font-mono text-brand-600 text-xs font-medium">{order.id}</td>
                  <td className="table-cell">
                    <p className="font-semibold text-slate-900 text-sm">{order.customerName}</p>
                    <p className="text-xs text-slate-500">{order.customerPhone}</p>
                  </td>
                  <td className="table-cell text-slate-500 text-xs">{formatDate(order.date)}</td>
                  <td className="table-cell text-center text-slate-500 font-medium">{order.items.length}</td>
                  <td className="table-cell text-right font-bold text-slate-900">{formatCurrency(order.total)}</td>
                  <td className="table-cell text-center">
                    <span className={`status-badge ${STATUS_COLORS[order.paymentStatus] || STATUS_COLORS.pending} px-3 py-1 font-bold text-[10px] uppercase tracking-wider`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="table-cell text-center">
                    <span className={`status-badge ${STATUS_COLORS[order.status]} inline-flex items-center gap-1.5 px-3 py-1 font-bold text-[10px] uppercase tracking-wider`}>
                      {statusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                  <td className="table-cell text-center">
                    <button onClick={() => setSelected(selected?.id === order.id ? null : order)} className="p-1.5 rounded-lg text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 transition-all">
                      <Eye size={15} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail */}
      {selected && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="section-card">
          <div className="flex justify-between mb-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-semibold text-slate-900">{selected.id} — Order Details</h2>
              <p className="text-xs text-slate-500">{selected.customerName} · {selected.shippingAddress}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-xs font-medium text-slate-500 hover:text-brand-600 transition-colors">Close</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full mb-4">
              <thead><tr className="border-b border-slate-50">
                <th className="table-head text-left">Product</th>
                <th className="table-head text-left">SKU</th>
                <th className="table-head text-center">Size</th>
                <th className="table-head text-center">Color</th>
                <th className="table-head text-center">Qty</th>
                <th className="table-head text-right">Amount</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {selected.items.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="table-cell font-medium text-slate-900">{item.productName}</td>
                    <td className="table-cell font-mono text-xs text-brand-600 font-medium">{item.sku}</td>
                    <td className="table-cell text-center"><span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{item.size}</span></td>
                    <td className="table-cell text-center text-slate-500 text-sm">{item.color}</td>
                    <td className="table-cell text-center font-bold text-slate-900">{item.qty}</td>
                    <td className="table-cell text-right font-semibold text-slate-900">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end gap-8 text-sm border-t border-slate-100 pt-4 mt-2">
              <div className="text-right space-y-2">
                <div className="flex justify-end gap-12"><span className="text-slate-500">Subtotal</span><span className="text-slate-900 font-semibold">{formatCurrency(selected.subtotal)}</span></div>
                <div className="flex justify-end gap-12"><span className="text-slate-500">Discount</span><span className="text-red-500 font-semibold">−{formatCurrency(selected.discount)}</span></div>
                <div className="flex justify-end gap-12 font-bold text-lg pt-1 border-t border-slate-100"><span className="text-slate-900">Total</span><span className="text-brand-600">{formatCurrency(selected.total)}</span></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
