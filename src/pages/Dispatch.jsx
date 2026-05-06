import { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, CheckCircle2, Package, Hash, ExternalLink } from 'lucide-react';
import useStore from '../store/useStore';
import { formatCurrency, formatDate, STATUS_COLORS } from '../lib/utils';

export default function Dispatch() {
  const { orders, dispatchOrder } = useStore();
  const [trackingInputs, setTrackingInputs] = useState({});
  const [dispatched, setDispatched] = useState({});

  const readyOrders = orders.filter((o) => o.status === 'packed' || o.status === 'confirmed');
  const doneOrders  = orders.filter((o) => o.status === 'dispatched');

  const handleDispatch = (orderId) => {
    const trackingId = trackingInputs[orderId] || `AUTO-${Date.now()}`;
    dispatchOrder(orderId, trackingId);
    setDispatched((d) => ({ ...d, [orderId]: true }));
  };

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="page-title">Dispatch</h1>
        <p className="text-slate-500 text-sm mt-1">Confirm shipment and update tracking for packed orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-xs text-slate-500 mb-1">Ready for Dispatch</p>
          <p className="text-2xl font-bold text-amber-600">{readyOrders.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-slate-500 mb-1">Dispatched Today</p>
          <p className="text-2xl font-bold text-emerald-600">{doneOrders.filter(o => o.date === new Date().toISOString().split('T')[0]).length}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-slate-500 mb-1">Total Dispatched</p>
          <p className="text-2xl font-bold text-brand-600">{doneOrders.length}</p>
        </div>
      </div>

      {/* Ready to dispatch */}
      {readyOrders.length > 0 && (
        <div className="section-card">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Ready for Dispatch</h2>
          <div className="space-y-3">
            {readyOrders.map((order) => (
              <motion.div
                key={order.id}
                layout
                className="bg-white rounded-2xl p-4 border border-amber-200 hover:border-amber-300 shadow-sm transition-all"
              >
                <div className="flex flex-wrap items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-brand-600 font-bold uppercase tracking-wider">{order.id}</span>
                      <span className={`status-badge ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                    </div>
                    <p className="text-base font-bold text-slate-900">{order.customerName}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{order.shippingAddress}</p>
                    <p className="text-xs text-slate-400 mt-1 font-medium">{formatDate(order.date)} · {order.items.length} item(s) · {formatCurrency(order.total)}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {order.items.map((item, i) => (
                        <span key={i} className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-100 font-bold uppercase tracking-tight">
                          {item.productName} ×{item.qty}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Hash size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Tracking ID"
                        value={trackingInputs[order.id] || ''}
                        onChange={(e) => setTrackingInputs((t) => ({ ...t, [order.id]: e.target.value }))}
                        className="input-field pl-8 w-44 text-xs"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleDispatch(order.id)}
                      disabled={!!dispatched[order.id]}
                      className="btn-primary disabled:opacity-50"
                    >
                      <Truck size={14} /> Dispatch
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {readyOrders.length === 0 && (
        <div className="section-card text-center py-12">
          <Truck size={40} className="mx-auto mb-3 text-slate-700" />
          <p className="text-slate-500 text-sm">No orders ready for dispatch</p>
          <p className="text-slate-700 text-xs mt-1">Mark orders as packed in Pick & Pack first</p>
        </div>
      )}

      {/* Dispatched orders */}
      {doneOrders.length > 0 && (
        <div className="section-card overflow-hidden">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Dispatched Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-head text-left">Order ID</th>
                  <th className="table-head text-left">Customer</th>
                  <th className="table-head text-left">Date</th>
                  <th className="table-head text-right">Amount</th>
                  <th className="table-head text-left">Tracking ID</th>
                  <th className="table-head text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {doneOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="table-cell font-mono text-brand-600 text-xs font-bold uppercase">{order.id}</td>
                    <td className="table-cell font-bold text-slate-900">{order.customerName}</td>
                    <td className="table-cell text-slate-500 text-xs">{formatDate(order.date)}</td>
                    <td className="table-cell text-right font-bold text-slate-900">{formatCurrency(order.total)}</td>
                    <td className="table-cell">
                      {order.trackingId ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-emerald-600 font-bold uppercase tracking-wider">{order.trackingId}</span>
                          <ExternalLink size={11} className="text-slate-600" />
                        </div>
                      ) : <span className="text-slate-600 text-xs">—</span>}
                    </td>
                    <td className="table-cell text-center">
                      <span className={`status-badge ${STATUS_COLORS.dispatched} inline-flex items-center gap-1`}>
                        <CheckCircle2 size={11} /> Dispatched
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
