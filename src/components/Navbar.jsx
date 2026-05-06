import { Bell, Search, Menu, Package, ShoppingBag, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

export default function Navbar() {
  const { orders, products, dismissedNotifications, dismissNotification, dismissAllNotifications } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const pendingOrders = orders
    .filter((o) => (o.status === 'pending' || o.status === 'confirmed') && !dismissedNotifications.includes(o.id));
  const lowStockItems = products
    .filter((p) => p.totalStock < 20 && !dismissedNotifications.includes(`low-${p.id}`));
  
  const totalAlerts = pendingOrders.length + lowStockItems.length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-[68px] bg-white border-b border-slate-200 flex items-center px-6 gap-4 sticky top-0 z-10 shadow-sm">
      {/* Search */}
      <div className="flex-1 max-w-sm relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search products, orders..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
        />
      </div>

      <div className="flex-1" />

      {/* Notifications */}
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className={`p-2 rounded-xl transition-all relative ${showNotifications ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
        >
          <Bell size={18} />
          {totalAlerts > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center border-2 border-white">
              {totalAlerts}
            </span>
          )}
        </button>

        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-slate-200 overflow-hidden z-50"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                <span className="text-[10px] font-bold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {totalAlerts} New
                </span>
              </div>

              <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                {totalAlerts === 0 ? (
                  <div className="p-10 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell size={20} className="text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">No new notifications</p>
                    <p className="text-xs text-slate-400 mt-1">We'll notify you when something happens.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {pendingOrders.map((order) => (
                      <div 
                        key={order.id} 
                        onClick={() => dismissNotification(order.id)}
                        className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600 group-hover:bg-blue-100 transition-colors">
                            <ShoppingBag size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">New Order: {order.id}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{order.customerName} placed an order</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium">{order.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {lowStockItems.map((product) => (
                      <div 
                        key={product.id} 
                        onClick={() => dismissNotification(`low-${product.id}`)}
                        className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 text-red-600 group-hover:bg-red-100 transition-colors">
                            <Package size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">Low Stock Alert</p>
                            <p className="text-xs text-slate-500 mt-0.5">{product.name} is running low ({product.totalStock} left)</p>
                            <p className="text-[10px] text-red-500 mt-1 font-bold uppercase tracking-wider">Immediate Attention</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {totalAlerts > 0 && (
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                  <button 
                    onClick={() => dismissAllNotifications([...pendingOrders.map(o => o.id), ...lowStockItems.map(p => `low-${p.id}`)])}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors uppercase tracking-widest"
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-200" />

      {/* Date + Brand */}
      <div className="hidden sm:block text-right">
        <p className="text-xs text-slate-400">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <p className="text-xs font-semibold text-brand-600">Praveen Trading Co.</p>
      </div>
    </header>
  );
}
