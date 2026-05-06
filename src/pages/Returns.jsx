import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, RotateCcw, ChevronDown, Trash2 } from 'lucide-react';
import useStore from '../store/useStore';
import { formatDate, STATUS_COLORS } from '../lib/utils';

const RETURN_REASONS = [
  'Size mismatch', 'Quality issue', 'Wrong item delivered',
  'Damaged product', 'Customer cancelled', 'Colour mismatch', 'Other',
];

export default function Returns() {
  const { orders, products, returns, addReturn } = useStore();
  const [tab, setTab] = useState('list');
  const [orderId, setOrderId] = useState('');
  const [reason, setReason]   = useState('');
  const [items, setItems]     = useState([{ productId: '', size: '', color: '', qty: 1 }]);
  const [success, setSuccess] = useState('');

  const dispatchedOrders = orders.filter((o) => o.status === 'dispatched');
  const selectedOrder    = orders.find((o) => o.id === orderId);

  const handleAddItem = () => setItems((i) => [...i, { productId: '', size: '', color: '', qty: 1 }]);
  const handleRemoveItem = (i) => setItems((it) => it.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) =>
    setItems((it) => it.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const handleSubmit = () => {
    if (!orderId || !reason || items.some((i) => !i.productId || !i.size || !i.color)) return;
    const retItems = items.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      return { productId: item.productId, productName: prod?.name || '', size: item.size, color: item.color, qty: Number(item.qty) };
    });
    const orderObj = orders.find((o) => o.id === orderId);
    addReturn({ orderId, customerName: orderObj?.customerName, reason, items: retItems });
    setSuccess('Return processed and stock updated!');
    setItems([{ productId: '', size: '', color: '', qty: 1 }]);
    setOrderId(''); setReason('');
    setTimeout(() => { setSuccess(''); setTab('list'); }, 1500);
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Returns Management</h1>
          <p className="text-slate-500 text-sm mt-1">Handle customer returns and update inventory accordingly</p>
        </div>
        <button onClick={() => setTab(tab === 'new' ? 'list' : 'new')} className="btn-primary">
          <Plus size={16} /> {tab === 'new' ? 'View Returns' : 'New Return'}
        </button>
      </div>

      {tab === 'new' ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="section-card max-w-2xl">
          <h2 className="text-base font-semibold text-slate-900 mb-6">Create Return Request</h2>

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-sm text-green-400 mb-4">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="label">Order ID</label>
              <div className="relative">
                <select value={orderId} onChange={(e) => setOrderId(e.target.value)} className="input-field appearance-none pr-8">
                  <option value="">-- Select dispatched order --</option>
                  {dispatchedOrders.map((o) => <option key={o.id} value={o.id}>{o.id} — {o.customerName}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {selectedOrder && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-500 space-y-1 shadow-sm">
                <p><span className="text-slate-400 font-bold uppercase tracking-tight w-20 inline-block">Customer:</span> <span className="text-slate-900 font-semibold">{selectedOrder.customerName}</span></p>
                <p><span className="text-slate-400 font-bold uppercase tracking-tight w-20 inline-block">Items:</span> <span className="text-slate-700">{selectedOrder.items.map(i => i.productName).join(', ')}</span></p>
              </div>
            )}

            <div>
              <label className="label">Return Reason</label>
              <div className="relative">
                <select value={reason} onChange={(e) => setReason(e.target.value)} className="input-field appearance-none pr-8">
                  <option value="">-- Select reason --</option>
                  {RETURN_REASONS.map((r) => <option key={r}>{r}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Return Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Returned Items</label>
                <button onClick={handleAddItem} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                  <Plus size={12} /> Add
                </button>
              </div>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2">
                    <div className="col-span-2">
                      <select value={item.productId} onChange={(e) => updateItem(i, 'productId', e.target.value)} className="input-field appearance-none text-xs">
                        <option value="">-- Product --</option>
                        {(selectedOrder?.items || products).map((p) => {
                          const pid = p.productId || p.id;
                          const pname = p.productName || p.name;
                          return <option key={pid} value={pid}>{pname}</option>;
                        })}
                      </select>
                    </div>
                    <input type="text" value={item.size} onChange={(e) => updateItem(i, 'size', e.target.value)} className="input-field text-xs" placeholder="Size" />
                    <div className="flex gap-1">
                      <input type="text" value={item.color} onChange={(e) => updateItem(i, 'color', e.target.value)} className="input-field text-xs" placeholder="Color" />
                      {items.length > 1 && (
                        <button onClick={() => handleRemoveItem(i)} className="p-1 text-slate-600 hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Qty:</span>
                    <input type="number" min={1} value={item.qty} onChange={(e) => updateItem(i, 'qty', e.target.value)} className="input-field w-20 text-xs" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 text-xs text-brand-600 font-medium">
              Returned stock will be automatically added back to inventory.
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleSubmit} className="btn-primary">
                <RotateCcw size={15} /> Process Return
              </button>
              <button onClick={() => setTab('list')} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="section-card overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">Return History</h2>
            <span className="text-xs text-slate-500 font-medium">{returns.length} returns</span>
          </div>
          {returns.length === 0 ? (
            <div className="text-center py-12 text-slate-600">
              <RotateCcw size={32} className="mx-auto mb-3 text-slate-700" />
              <p className="text-sm">No returns recorded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="table-head text-left">Return ID</th>
                    <th className="table-head text-left">Order ID</th>
                    <th className="table-head text-left">Customer</th>
                    <th className="table-head text-left">Date</th>
                    <th className="table-head text-left">Reason</th>
                    <th className="table-head text-center">Items</th>
                    <th className="table-head text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {returns.map((ret) => (
                    <tr key={ret.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="table-cell font-mono text-brand-600 text-xs font-bold uppercase">{ret.id}</td>
                      <td className="table-cell font-mono text-xs text-slate-400">{ret.orderId}</td>
                      <td className="table-cell font-semibold text-slate-900">{ret.customerName}</td>
                      <td className="table-cell text-slate-500 text-xs">{formatDate(ret.date)}</td>
                      <td className="table-cell text-slate-500 text-xs font-medium">{ret.reason}</td>
                      <td className="table-cell text-center text-slate-500 font-bold">{ret.items.length}</td>
                      <td className="table-cell text-center">
                        <span className={`status-badge ${STATUS_COLORS[ret.status]}`}>
                          {ret.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
