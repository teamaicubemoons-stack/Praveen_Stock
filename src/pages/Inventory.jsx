import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Edit2, ArrowUpDown } from 'lucide-react';
import useStore from '../store/useStore';
import { formatCurrency, STATUS_COLORS } from '../lib/utils';

export default function Inventory() {
  const { products } = useStore();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [selected, setSelected] = useState(null);

  const categories = [...new Set(products.map((p) => p.category))];

  const filtered = products
    .filter((p) => {
      const q = search.toLowerCase();
      const matchSearch = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const matchCat    = filterCat    ? p.category === filterCat    : true;
      const matchStatus = filterStatus ? p.status   === filterStatus : true;
      return matchSearch && matchCat && matchStatus;
    })
    .sort((a, b) => {
      const va = a[sortField]; const vb = b[sortField];
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === 'asc' ? va - vb : vb - va;
    });

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="page-title">Inventory</h1>
        <p className="text-slate-500 text-sm mt-1">View and manage all product stock levels</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU..."
            className="input-field pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="input-field w-36 text-xs">
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-32 text-xs">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="low_stock">Low Stock</option>
          </select>
        </div>
        <span className="text-xs text-slate-500 ml-auto">{filtered.length} products</span>
      </div>

      {/* Table */}
      <div className="section-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="table-head text-left w-[25%] cursor-pointer select-none" onClick={() => toggleSort('name')}>
                  <span className="flex items-center gap-1 uppercase">Product <ArrowUpDown size={10} /></span>
                </th>
                <th className="table-head text-left w-[15%] cursor-pointer select-none" onClick={() => toggleSort('sku')}>
                  <span className="flex items-center gap-1 uppercase">SKU <ArrowUpDown size={10} /></span>
                </th>
                <th className="table-head text-left w-[12%] uppercase">Category</th>
                <th className="table-head text-left w-[18%] cursor-pointer select-none" onClick={() => toggleSort('totalStock')}>
                  <span className="flex items-center gap-1 uppercase">Stock <ArrowUpDown size={10} /></span>
                </th>
                <th className="table-head text-left w-[10%] uppercase">MRP</th>
                <th className="table-head text-center w-[10%] uppercase">Status</th>
                <th className="table-head text-center w-[10%] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((product) => (
                <motion.tr
                  key={product.id}
                  layout
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="table-cell">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.variants.length} variants</p>
                    </div>
                  </td>
                  <td className="table-cell font-mono text-xs text-brand-600 font-medium">{product.sku}</td>
                  <td className="table-cell">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">{product.category}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${product.totalStock < 20 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-brand-500 shadow-[0_0_8px_rgba(79,70,229,0.3)]'}`}
                          style={{ width: `${Math.min(100, (product.totalStock / 500) * 100)}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold ${product.totalStock < 20 ? 'text-red-600' : 'text-slate-700'}`}>
                        {product.totalStock}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell font-bold text-slate-900">{formatCurrency(product.mrp)}</td>
                  <td className="table-cell text-center">
                    <span className={`status-badge !rounded-full !px-3 ${product.totalStock < 20 ? STATUS_COLORS['low_stock'] : STATUS_COLORS['active']}`}>
                      {product.totalStock < 20 ? 'Low Stock' : 'Active'}
                    </span>
                  </td>
                  <td className="table-cell text-center">
                    <button
                      onClick={() => setSelected(selected?.id === product.id ? null : product)}
                      className={`p-2 rounded-xl transition-all ${selected?.id === product.id ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-brand-600 hover:bg-brand-50'}`}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Variant Detail Panel */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="section-card"
        >
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-semibold text-slate-900">{selected.name} — Variants</h2>
              <p className="text-xs text-slate-400 font-mono">{selected.sku}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-xs font-medium text-slate-500 hover:text-brand-600 transition-colors">Close</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="table-head text-left">Size</th>
                  <th className="table-head text-left">Color</th>
                  <th className="table-head text-center">Quantity</th>
                  <th className="table-head text-center">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {selected.variants.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="table-cell">
                      <span className="text-xs bg-slate-50 text-slate-600 px-2 py-1 rounded-md font-medium border border-slate-100">{v.size}</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full border border-slate-200 shadow-sm" style={{ background: v.color.toLowerCase() }} />
                        <span className="text-sm text-slate-600">{v.color}</span>
                      </div>
                    </td>
                    <td className="table-cell text-center font-bold text-slate-900">{v.qty}</td>
                    <td className="table-cell text-center font-mono text-xs text-brand-600 font-medium">{v.warehouseLocation || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
