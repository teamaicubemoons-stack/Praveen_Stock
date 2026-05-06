import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, Upload, ChevronDown, Building2 } from 'lucide-react';
import useStore from '../store/useStore';
import { formatDate, STATUS_COLORS } from '../lib/utils';

export default function StockInward() {
  const { suppliers, inwardStock, addInward, addSupplier } = useStore();
  const [tab, setTab] = useState('list'); // list | new
  const [form, setForm] = useState({
    supplierId: '',
    supplierName: '',
    newSupplier: '',
    items: [{ name: '', qty: '' }],
  });
  const [success, setSuccess] = useState(false);

  const handleAddItem = () =>
    setForm((f) => ({ ...f, items: [...f.items, { name: '', qty: '' }] }));

  const handleRemoveItem = (i) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const handleItemChange = (i, field, value) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)),
    }));

  const handleSave = () => {
    let supplierName = form.supplierName;
    let supplierId   = form.supplierId;
    if (form.newSupplier.trim()) {
      const ns = { name: form.newSupplier.trim(), contact: '', city: '' };
      addSupplier(ns);
      supplierName = ns.name;
      supplierId   = `s${Date.now()}`;
    }
    const validItems = form.items.filter((it) => it.name.trim() && it.qty);
    if (!supplierName || validItems.length === 0) return;

    addInward({
      supplierId,
      supplierName,
      items: validItems.map((it) => ({ name: it.name.trim(), qty: Number(it.qty) })),
    });
    setForm({ supplierId: '', supplierName: '', newSupplier: '', items: [{ name: '', qty: '' }] });
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setTab('list'); }, 1200);
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Stock Inward</h1>
          <p className="text-slate-500 text-sm mt-1">Record new incoming stock from suppliers</p>
        </div>
        <button onClick={() => setTab(tab === 'new' ? 'list' : 'new')} className="btn-primary">
          <Plus size={16} /> {tab === 'new' ? 'View All' : 'New Entry'}
        </button>
      </div>

      {/* Tabs */}
      {tab === 'new' ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="section-card max-w-2xl">
          <h2 className="text-base font-semibold text-slate-900 mb-6">New Stock Entry</h2>

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-sm text-green-400 mb-4">
              Stock entry saved successfully!
            </div>
          )}

          {/* Supplier */}
          <div className="space-y-4">
            <div>
              <label className="label">Select Supplier</label>
              <div className="relative">
                <select
                  value={form.supplierId}
                  onChange={(e) => {
                    const s = suppliers.find((s) => s.id === e.target.value);
                    setForm((f) => ({ ...f, supplierId: e.target.value, supplierName: s?.name || '' }));
                  }}
                  className="input-field appearance-none pr-8"
                >
                  <option value="">-- Select supplier --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">or add new supplier</span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <div>
              <label className="label">New Supplier Name</label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={form.newSupplier}
                  onChange={(e) => setForm((f) => ({ ...f, newSupplier: e.target.value }))}
                  className="input-field pl-9"
                  placeholder="e.g. Krishna Textiles, Surat"
                />
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Incoming Items</label>
                <button onClick={handleAddItem} className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 font-semibold transition-colors">
                  <Plus size={12} /> Add Item
                </button>
              </div>
              <div className="space-y-2">
                {form.items.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(i, 'name', e.target.value)}
                      className="input-field flex-1"
                      placeholder="Item name (e.g. Cotton Shirt)"
                    />
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => handleItemChange(i, 'qty', e.target.value)}
                      className="input-field w-28"
                      placeholder="Qty"
                      min={1}
                    />
                    {form.items.length > 1 && (
                      <button onClick={() => handleRemoveItem(i)} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CSV Upload (UI only) */}
            <div className="border border-dashed border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:border-brand-300 hover:bg-brand-50/50 transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload size={18} className="text-brand-600" />
              </div>
              <div>
                <p className="text-sm text-slate-900 font-bold">Bulk Import CSV</p>
                <p className="text-xs text-slate-500 font-medium">Click to upload or drag and drop spreadsheet</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} className="btn-primary">
                <Save size={15} /> Save Entry
              </button>
              <button onClick={() => setTab('list')} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="section-card overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">All Inward Entries</h2>
            <span className="text-xs text-slate-500 font-medium">{inwardStock.length} entries</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-head text-left">Entry ID</th>
                  <th className="table-head text-left">Supplier</th>
                  <th className="table-head text-left">Date</th>
                  <th className="table-head text-center">Items</th>
                  <th className="table-head text-center">Total Qty</th>
                  <th className="table-head text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {inwardStock.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="table-cell font-mono text-brand-600 text-xs font-bold uppercase">{entry.id}</td>
                    <td className="table-cell font-semibold text-slate-900">{entry.supplierName}</td>
                    <td className="table-cell text-slate-500 text-xs">{formatDate(entry.date)}</td>
                    <td className="table-cell text-center text-slate-500 font-medium">{entry.items.length}</td>
                    <td className="table-cell text-center font-bold text-slate-900">
                      {entry.items.reduce((s, it) => s + it.qty, 0)}
                    </td>
                    <td className="table-cell text-center">
                      <span className={`status-badge ${STATUS_COLORS[entry.status]}`}>
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
