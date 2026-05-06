import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Package, ListChecks, Printer } from 'lucide-react';
import useStore from '../store/useStore';
import { formatDate, STATUS_COLORS } from '../lib/utils';

export default function Picking() {
  const { orders, updatePickingStatus, updatePackingStatus, updateOrderStatus } = useStore();
  const [selected, setSelected] = useState(null);
  const [pickedItems, setPickedItems] = useState({});

  const activeOrders = orders.filter((o) => ['confirmed','packed'].includes(o.status) || o.pickingStatus === 'pending');

  const togglePicked = (orderId, idx) => {
    const key = `${orderId}-${idx}`;
    setPickedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isPicked = (orderId, idx) => !!pickedItems[`${orderId}-${idx}`];

  const handleMarkPicked = (order) => {
    updatePickingStatus(order.id, 'done');
    if (selected?.id === order.id) setSelected({ ...order, pickingStatus: 'done' });
  };

  const handleMarkPacked = (order) => {
    updatePackingStatus(order.id, 'done');
    updateOrderStatus(order.id, 'packed');
    if (selected?.id === order.id) setSelected({ ...order, packingStatus: 'done', status: 'packed' });
  };

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="page-title">Pick & Pack</h1>
        <p className="text-slate-500 text-sm mt-1">Manage warehouse picking lists and packing operations</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Order Queue */}
        <div className="section-card">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Active Orders Queue</h2>
          {activeOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-600">
              <CheckCircle2 size={32} className="mx-auto mb-3 text-green-500/30" />
              <p className="text-sm">No orders pending pick & pack</p>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.filter(o => o.status !== 'dispatched').map((order) => (
                <motion.div
                  key={order.id}
                  whileHover={{ x: 2 }}
                  onClick={() => setSelected(order)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selected?.id === order.id
                      ? 'border-brand-300 bg-brand-50 shadow-sm'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-brand-600 font-bold uppercase">{order.id}</span>
                        <span className={`status-badge ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800 mt-1">{order.customerName}</p>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <div className="flex items-center gap-1 justify-end mb-1">
                        <Package size={11} />
                        <span className={`font-medium ${order.pickingStatus === 'done' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          Pick: {order.pickingStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        <ListChecks size={11} />
                        <span className={`font-medium ${order.packingStatus === 'done' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          Pack: {order.packingStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Picking Detail */}
        <div className="section-card">
          <h2 className="text-base font-semibold text-slate-900 mb-4">
            {selected ? `Picking List — ${selected.id}` : 'Select an order'}
          </h2>

          {!selected ? (
            <div className="text-center py-12 text-slate-600">
              <ListChecks size={32} className="mx-auto mb-3 text-slate-700" />
              <p className="text-sm">Select an order from the queue</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-500 space-y-1 shadow-sm">
                <p><span className="text-slate-400 font-bold uppercase tracking-tight w-20 inline-block">Customer:</span> <span className="text-slate-900 font-semibold">{selected.customerName}</span></p>
                <p><span className="text-slate-400 font-bold uppercase tracking-tight w-20 inline-block">Date:</span> <span className="text-slate-700">{formatDate(selected.date)}</span></p>
                <p><span className="text-slate-400 font-bold uppercase tracking-tight w-20 inline-block">Shipping:</span> <span className="text-slate-700">{selected.shippingAddress}</span></p>
              </div>

              {/* Items Checklist */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Items to Pick</p>
                {selected.items.map((item, i) => {
                  const picked = isPicked(selected.id, i);
                  return (
                    <motion.div
                      key={i}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => togglePicked(selected.id, i)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        picked ? 'border-emerald-200 bg-emerald-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      {picked
                        ? <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                        : <Circle size={18} className="text-slate-300 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${picked ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{item.productName}</p>
                        <p className={`text-xs ${picked ? 'text-slate-300' : 'text-slate-500'}`}>{item.size} / {item.color} · {item.qty} pcs · {item.sku}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap pt-2">
                <button
                  onClick={() => handleMarkPicked(selected)}
                  disabled={selected.pickingStatus === 'done'}
                  className="btn-primary disabled:opacity-40"
                >
                  <CheckCircle2 size={15} />
                  {selected.pickingStatus === 'done' ? 'Picked' : 'Mark Picked'}
                </button>
                <button
                  onClick={() => handleMarkPacked(selected)}
                  disabled={selected.pickingStatus !== 'done' || selected.packingStatus === 'done'}
                  className="btn-secondary disabled:opacity-40"
                >
                  <Package size={15} />
                  {selected.packingStatus === 'done' ? 'Packed' : 'Mark Packed'}
                </button>
                <button className="btn-secondary">
                  <Printer size={15} /> Print List
                </button>
              </div>

              {/* Progress */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-3 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operation Progress</p>
                {[
                  { label: 'Picking', done: selected.pickingStatus === 'done' },
                  { label: 'Packing', done: selected.packingStatus === 'done' },
                  { label: 'Ready for Dispatch', done: selected.status === 'packed' || selected.status === 'dispatched' },
                ].map((step) => (
                  <div key={step.label} className="flex items-center gap-3">
                    {step.done
                      ? <CheckCircle2 size={16} className="text-emerald-500" />
                      : <Circle size={16} className="text-slate-300" />}
                    <span className={`text-sm font-medium ${step.done ? 'text-emerald-600' : 'text-slate-400'}`}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
