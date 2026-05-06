import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, ChevronDown, Tag, AlertCircle } from 'lucide-react';
import useStore from '../store/useStore';
import { generateSKU, STATUS_COLORS } from '../lib/utils';

export default function Verification() {
  const { inwardStock, products, addProduct, verifyInwardItem } = useStore();
  const [selectedId, setSelectedId] = useState('');
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [variants, setVariants] = useState([{ size: '', color: '', qty: '' }]);
  const [category, setCategory] = useState('');
  const [mrp, setMrp] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const pendingEntries = inwardStock.filter((e) => e.status === 'pending');
  const selectedEntry  = inwardStock.find((e) => e.id === selectedId);
  const selectedItem   = selectedEntry?.items[selectedItemIndex];

  const handleAddVariant = () =>
    setVariants((v) => [...v, { size: '', color: '', qty: '' }]);

  const handleVariantChange = (i, field, value) =>
    setVariants((v) => v.map((vt, idx) => (idx === i ? { ...vt, [field]: value } : vt)));

  const handleConvert = () => {
    setError('');
    const validVariants = variants.filter((v) => v.size && v.color && v.qty);
    const totalVariantQty = validVariants.reduce((sum, v) => sum + Number(v.qty), 0);

    if (!selectedItem) {
      setError('Please select an item to convert.');
      return;
    }
    if (validVariants.length === 0 || !category) {
      setError('Please fill in category and at least one variant.');
      return;
    }
    if (totalVariantQty > selectedItem.qty) {
      setError(`Quantity mismatch! Total variants (${totalVariantQty}) exceeds available quantity (${selectedItem.qty}).`);
      return;
    }

    const prodCount = products.length + 1;
    const builtVariants = validVariants.map((v, i) => ({
      id: `V${Date.now()}_${i}`,
      size: v.size, 
      color: v.color, 
      qty: Number(v.qty),
      warehouseLocation: '',
    }));

    // Add as new product
    addProduct({
      name: selectedItem.name,
      category,
      inwardId: selectedId,
      sku: generateSKU(selectedItem.name, validVariants[0].size, validVariants[0].color, prodCount),
      variants: builtVariants,
      totalStock: builtVariants.reduce((s, v) => s + v.qty, 0),
      mrp: Number(mrp) || 0,
      costPrice: Number(costPrice) || 0,
      status: 'active',
    });

    // Update inward entry logic
    verifyInwardItem(selectedId, selectedItem.name, totalVariantQty);

    setSuccess(`Verified ${totalVariantQty} pcs of "${selectedItem.name}" successfully!`);
    setVariants([{ size: '', color: '', qty: '' }]);
    setSelectedItemIndex(0); // Reset selection
    
    // If no items left in selected entry, clear selection
    const updatedEntry = useStore.getState().inwardStock.find(e => e.id === selectedId);
    if (!updatedEntry || updatedEntry.items.length === 0) {
      setSelectedId('');
    }

    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Item Verification</h1>
        <p className="text-slate-500 text-sm mt-1">Convert raw inward stock into structured products with variants</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: Select Inward Entry */}
        <div className="section-card">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Pending Inward Entries</h2>
          {pendingEntries.length === 0 ? (
            <div className="text-center py-12 text-slate-600">
              <Check size={32} className="mx-auto mb-3 text-green-500/30" />
              <p className="text-sm">All entries have been verified</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  whileHover={{ x: 2 }}
                  onClick={() => {
                    setSelectedId(entry.id);
                    setSelectedItemIndex(0);
                    setError('');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedId === entry.id
                      ? 'border-brand-300 bg-brand-50 shadow-sm'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{entry.id}</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{entry.supplierName}</p>
                    </div>
                    <span className={`status-badge ${STATUS_COLORS[entry.status]}`}>
                      {entry.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {entry.items.map((item, i) => (
                      <span key={i} className="text-[10px] bg-white text-slate-600 px-2 py-1 rounded-md font-bold uppercase tracking-tight border border-slate-200">
                        {item.name} × {item.qty}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Verification Form */}
        <div className="section-card h-fit">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Verify & Convert to Product</h2>

          {success && (
            <div className="bg-green-50 flex items-center gap-2 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 mb-4">
              <Check size={16} /> {success}
            </div>
          )}

          {error && (
            <div className="bg-red-50 flex items-center gap-2 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {!selectedEntry ? (
            <div className="text-center py-12 text-slate-600">
              <Tag size={32} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium">Select a pending entry to verify</p>
              <p className="text-xs text-slate-400 mt-1 text-balance">Choose an entry from the left list to begin the verification process.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Items in selected entry Summary */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Available items in {selectedId}</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {selectedEntry.items.map((item, i) => (
                    <div key={i} className={`flex justify-between text-sm py-1 border-b border-slate-100 last:border-0 ${selectedItemIndex === i ? 'text-brand-700 font-bold' : 'text-slate-600'}`}>
                      <span>{item.name}</span>
                      <span>{item.qty} pcs</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Select item to convert */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Item to Convert</label>
                  <div className="relative">
                    <select 
                      value={selectedItemIndex} 
                      onChange={(e) => setSelectedItemIndex(Number(e.target.value))}
                      className="input-field appearance-none pr-8"
                    >
                      {selectedEntry.items.map((item, i) => (
                        <option key={i} value={i}>{item.name} ({item.qty} available)</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="label">Category</label>
                  <div className="relative">
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field appearance-none pr-8">
                      <option value="">Select Category</option>
                      {['Shirts','Bottoms','Ethnic','T-Shirts','Jackets','Accessories'].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">MRP (₹)</label>
                  <input type="number" value={mrp} onChange={(e) => setMrp(e.target.value)} className="input-field" placeholder="499" />
                </div>
                <div>
                  <label className="label">Cost Price (₹)</label>
                  <input type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} className="input-field" placeholder="280" />
                </div>
              </div>

              {/* Variants */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="label mb-0">Variants Setup</label>
                  <button onClick={handleAddVariant} className="text-[11px] bg-brand-50 text-brand-600 hover:bg-brand-100 px-3 py-1 rounded-full flex items-center gap-1 font-bold transition-all uppercase tracking-wider">
                    <Plus size={12} /> Add Variant
                  </button>
                </div>
                <div className="space-y-3">
                  {variants.map((v, i) => (
                    <div key={i} className="flex gap-2 items-end group">
                      <div className="flex-1">
                        <label className="text-[10px] text-slate-400 font-bold mb-1 block uppercase">Size</label>
                        <input type="text" value={v.size} onChange={(e) => handleVariantChange(i, 'size', e.target.value)} className="input-field !py-1.5" placeholder="M/L/32" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] text-slate-400 font-bold mb-1 block uppercase">Color</label>
                        <input type="text" value={v.color} onChange={(e) => handleVariantChange(i, 'color', e.target.value)} className="input-field !py-1.5" placeholder="Red" />
                      </div>
                      <div className="w-24">
                        <label className="text-[10px] text-slate-400 font-bold mb-1 block uppercase">Qty</label>
                        <input type="number" value={v.qty} onChange={(e) => handleVariantChange(i, 'qty', e.target.value)} className="input-field !py-1.5" placeholder="0" />
                      </div>
                      {variants.length > 1 && (
                        <button 
                          onClick={() => setVariants(vs => vs.filter((_, idx) => idx !== i))}
                          className="p-2 mb-0.5 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Plus size={16} className="rotate-45" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleConvert}
                  disabled={!selectedItem}
                  className="btn-primary w-full justify-center h-12 text-base shadow-brand"
                >
                  <Check size={18} /> Convert & Verify Item
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-3 uppercase tracking-widest font-medium">
                  This will reduce quantity from the inward entry
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
