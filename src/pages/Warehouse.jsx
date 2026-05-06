import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Check, ChevronDown } from 'lucide-react';
import useStore from '../store/useStore';

const ZONES  = ['A', 'B', 'C'];
const RACKS  = ['R1', 'R2', 'R3'];
const SHELVES= ['S1', 'S2', 'S3', 'S4'];
const BOXES  = ['B1', 'B2', 'B3'];

export default function Warehouse() {
  const { products, warehouseLocations, assignWarehouseLocation } = useStore();
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [zone,  setZone]  = useState('A');
  const [rack,  setRack]  = useState('R1');
  const [shelf, setShelf] = useState('S1');
  const [box,   setBox]   = useState('B1');
  const [success, setSuccess] = useState('');

  const product = products.find((p) => p.id === selectedProduct);
  const variant = product?.variants.find((v) => v.id === selectedVariant);

  const handleAssign = () => {
    if (!selectedProduct || !selectedVariant) return;
    const location = `${zone}-${rack}-${shelf}`;
    assignWarehouseLocation(selectedProduct, selectedVariant, location);
    setSuccess(`Location ${location} assigned to ${product?.name} (${variant?.size} / ${variant?.color})`);
    setTimeout(() => setSuccess(''), 3000);
  };

  // Capacity overview
  const totalCapacity = warehouseLocations.reduce((s, w) => s + w.capacity, 0);
  const totalUsed     = warehouseLocations.reduce((s, w) => s + w.used, 0);
  const utilization   = Math.round((totalUsed / totalCapacity) * 100);

  const zones = ['A', 'B', 'C'];

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="page-title">Warehouse Management</h1>
        <p className="text-slate-500 text-sm mt-1">Assign and manage product storage locations</p>
      </div>

      {/* Capacity Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-xs text-slate-500 mb-1">Total Capacity</p>
          <p className="text-2xl font-bold text-slate-900">{totalCapacity.toLocaleString()}</p>
          <p className="text-xs text-slate-400">units across all zones</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-slate-500 mb-1">Currently Used</p>
          <p className="text-2xl font-bold text-slate-900">{totalUsed.toLocaleString()}</p>
          <p className="text-xs text-slate-400">units in storage</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-slate-500 mb-1">Utilization</p>
          <div className="flex items-end gap-2">
            <p className={`text-2xl font-bold ${utilization > 85 ? 'text-red-600' : 'text-brand-600'}`}>{utilization}%</p>
          </div>
          <div className="mt-2 bg-slate-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${utilization > 85 ? 'bg-red-500' : 'bg-brand-500'}`}
              style={{ width: `${utilization}%` }}
            />
          </div>
        </div>
      </div>

      {/* Zone Map */}
      <div className="section-card">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Zone Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {zones.map((z) => {
            const zoneLocations = warehouseLocations.filter((w) => w.zone === z);
            const zCap  = zoneLocations.reduce((s, w) => s + w.capacity, 0);
            const zUsed = zoneLocations.reduce((s, w) => s + w.used, 0);
            const zUtil = zCap > 0 ? Math.round((zUsed / zCap) * 100) : 0;
            return (
              <div key={z} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                      <span className="text-brand-600 font-bold text-sm">Z{z}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-800">Zone {z}</span>
                  </div>
                  <span className={`text-xs font-bold ${zUtil > 85 ? 'text-red-600' : 'text-brand-600'}`}>{zUtil}%</span>
                </div>
                <div className="bg-slate-100 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full ${zUtil > 85 ? 'bg-red-500' : 'bg-brand-500'}`}
                    style={{ width: `${zUtil}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {zoneLocations.map((loc) => (
                    <div
                      key={loc.id}
                      className={`text-[10px] rounded-lg px-2 py-1.5 text-center font-bold uppercase tracking-tight ${
                        (loc.used / loc.capacity) > 0.9
                          ? 'bg-red-50 text-red-600 border border-red-100'
                          : (loc.used / loc.capacity) > 0.7
                          ? 'bg-amber-50 text-amber-600 border border-amber-100'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}
                    >
                      {loc.label}
                    </div>
                  ))}
                </div>
                <p className="text-[11px] font-medium text-slate-400 mt-3">{zUsed.toLocaleString()} / {zCap.toLocaleString()} units</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assign Location */}
      <div className="section-card max-w-xl">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Assign Location to Product</h2>

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-sm text-green-400 mb-4 flex items-center gap-2">
            <Check size={14} /> {success}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="label">Product</label>
            <div className="relative">
              <select value={selectedProduct} onChange={(e) => { setSelectedProduct(e.target.value); setSelectedVariant(''); }} className="input-field appearance-none pr-8">
                <option value="">-- Select product --</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {product && (
            <div>
              <label className="label">Variant</label>
              <div className="relative">
                <select value={selectedVariant} onChange={(e) => setSelectedVariant(e.target.value)} className="input-field appearance-none pr-8">
                  <option value="">-- Select variant --</option>
                  {product.variants.map((v) => <option key={v.id} value={v.id}>{v.size} / {v.color} ({v.qty} pcs)</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {[['Zone', zone, setZone, ZONES],['Rack', rack, setRack, RACKS],['Shelf', shelf, setShelf, SHELVES]].map(([label, val, setter, opts]) => (
              <div key={label}>
                <label className="label">{label}</label>
                <div className="relative">
                  <select value={val} onChange={(e) => setter(e.target.value)} className="input-field appearance-none pr-8 text-xs">
                    {opts.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center gap-3 shadow-sm">
            <MapPin size={16} className="text-brand-600" />
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Location Code</p>
              <p className="text-base font-bold text-brand-600 font-mono">{zone}-{rack}-{shelf}</p>
            </div>
          </div>

          <button onClick={handleAssign} disabled={!selectedProduct || !selectedVariant} className="btn-primary disabled:opacity-40">
            <MapPin size={15} /> Assign Location
          </button>
        </div>
      </div>

      {/* Products with locations */}
      <div className="section-card overflow-hidden">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Product Location Registry</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="table-head text-left">Product</th>
                <th className="table-head text-left">SKU</th>
                <th className="table-head text-left">Size</th>
                <th className="table-head text-left">Color</th>
                <th className="table-head text-center">Qty</th>
                <th className="table-head text-center">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.flatMap((p) =>
                p.variants.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="table-cell font-semibold text-slate-900">{p.name}</td>
                    <td className="table-cell font-mono text-xs text-brand-600 font-medium">{p.sku}</td>
                    <td className="table-cell"><span className="text-xs bg-slate-50 text-slate-600 px-2 py-1 rounded border border-slate-100 font-medium">{v.size}</span></td>
                    <td className="table-cell text-slate-500 text-sm font-medium">{v.color}</td>
                    <td className="table-cell text-center font-bold text-slate-900">{v.qty}</td>
                    <td className="table-cell text-center">
                      {v.warehouseLocation ? (
                        <span className="font-mono text-xs text-brand-600 bg-brand-50 border border-brand-100 px-2 py-1 rounded-md font-medium">{v.warehouseLocation}</span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Unassigned</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
