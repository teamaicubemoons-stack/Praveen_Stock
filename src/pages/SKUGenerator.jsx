import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, Check, Barcode, Tag, RefreshCw } from 'lucide-react';
import useStore from '../store/useStore';
import { generateSKU } from '../lib/utils';

function FakeBarcode({ value, dark = false }) {
  // Generate deterministic bar widths from the SKU string
  const bars = value.split('').map((ch, i) => ({
    width: (ch.charCodeAt(0) % 3) + 1,
    gap: i % 4 === 0 ? 3 : 1,
  }));

  const barColor = dark ? 'bg-slate-800' : 'bg-black';

  return (
    <div className="flex items-end justify-center gap-0 h-16 px-4">
      {bars.slice(0, 60).map((bar, i) => (
        <div
          key={i}
          className={`${barColor} flex-shrink-0`}
          style={{
            width: bar.width,
            height: `${50 + (i % 3) * 10}%`,
            marginRight: bar.gap,
          }}
        />
      ))}
    </div>
  );
}

export default function SKUGenerator() {
  const { products } = useStore();
  const [selectedProduct, setSelectedProduct] = useState('');
  const [copiedSku, setCopiedSku] = useState('');

  const product = products.find((p) => p.id === selectedProduct);

  const handleCopy = (sku) => {
    navigator.clipboard.writeText(sku).catch(() => {});
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(''), 2000);
  };

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="page-title">SKU Management</h1>
        <p className="text-slate-500 text-sm mt-1">View, generate, and manage product SKUs and barcodes</p>
      </div>

      {/* Product Selector */}
      <div className="section-card max-w-xl">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Select Product</h2>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="input-field"
        >
          <option value="">-- Select a product --</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.category})</option>)}
        </select>
      </div>

      {/* SKU Barcode Display */}
      {product && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="section-card"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">{product.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{product.category} · {product.variants.length} variants</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-brand-50 border border-brand-100 rounded-lg px-3 py-1.5">
                <Tag size={13} className="text-brand-600" />
                <span className="text-xs font-mono text-brand-600 font-bold">{product.sku}</span>
              </div>
            </div>
          </div>

          {/* Main Product Barcode */}
          <div className="bg-slate-50 rounded-2xl p-6 text-center mb-6 max-w-sm mx-auto border border-slate-100 shadow-sm">
            <FakeBarcode value={product.sku} dark={true} />
            <p className="text-slate-900 text-xs font-mono mt-4 tracking-widest font-bold">{product.sku}</p>
          </div>

          <div className="flex items-center justify-center gap-3 mb-8">
            <button
              onClick={() => handleCopy(product.sku)}
              className="btn-secondary"
            >
              {copiedSku === product.sku ? <><Check size={14} className="text-green-400" /> Copied!</> : <><Copy size={14} /> Copy SKU</>}
            </button>
            <button className="btn-secondary">
              <Download size={14} /> Download PNG
            </button>
          </div>

          {/* All Variants */}
          <h3 className="text-sm font-semibold text-slate-900 mb-3">All Variant SKUs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.variants.map((variant, i) => {
              const variantSku = generateSKU(product.name, variant.size, variant.color, i + 1);
              return (
                <motion.div
                  key={variant.id}
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-2xl p-4 border border-slate-100 hover:border-brand-200 shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                      <span className="text-[10px] bg-brand-50 text-brand-600 px-2 py-0.5 rounded font-bold uppercase border border-brand-100">{variant.size}</span>
                      <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded font-bold uppercase border border-purple-100">{variant.color}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{variant.qty} pcs</span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 mb-3 border border-slate-100">
                    <FakeBarcode value={variantSku} dark={true} />
                    <p className="text-slate-900 text-[9px] font-mono text-center mt-2 truncate tracking-wider font-bold">{variantSku}</p>
                  </div>

                  <button
                    onClick={() => handleCopy(variantSku)}
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-brand-400 transition-colors py-1"
                  >
                    {copiedSku === variantSku ? <><Check size={11} className="text-green-400" /> Copied</> : <><Copy size={11} /> Copy</>}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* All Products SKU Table */}
      <div className="section-card overflow-hidden">
        <h2 className="text-base font-semibold text-slate-900 mb-4">All Product SKUs</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="table-head text-left">Product</th>
                <th className="table-head text-left">Category</th>
                <th className="table-head text-left">SKU</th>
                <th className="table-head text-center">Variants</th>
                <th className="table-head text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="table-cell font-bold text-slate-900">{p.name}</td>
                  <td className="table-cell">
                    <span className="text-xs bg-slate-50 text-slate-600 px-2 py-1 rounded border border-slate-100 font-medium">{p.category}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <Barcode size={13} className="text-slate-400" />
                      <span className="font-mono text-xs text-brand-600 font-bold uppercase">{p.sku}</span>
                    </div>
                  </td>
                  <td className="table-cell text-center text-slate-500 font-bold">{p.variants.length}</td>
                  <td className="table-cell text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleCopy(p.sku)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 transition-all"
                        title="Copy SKU"
                      >
                        {copiedSku === p.sku ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                      </button>
                      <button
                        onClick={() => setSelectedProduct(p.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                        title="View barcode"
                      >
                        <Barcode size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
