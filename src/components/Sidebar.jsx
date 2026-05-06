import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, PackagePlus, ClipboardCheck, Boxes,
  Warehouse, ShoppingCart, ListChecks, Truck, BarChart3,
  Settings, LogOut, ChevronRight, Package,
} from 'lucide-react';
import useStore from '../store/useStore';

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/inward',       label: 'Stock Inward', icon: PackagePlus     },
  { to: '/verification', label: 'Verification', icon: ClipboardCheck  },
  { to: '/inventory',    label: 'Inventory',    icon: Boxes           },
  { to: '/warehouse',    label: 'Warehouse',    icon: Warehouse       },
  { to: '/orders',       label: 'Orders',       icon: ShoppingCart    },
  { to: '/picking',      label: 'Pick & Pack',  icon: ListChecks      },
  { to: '/dispatch',     label: 'Dispatch',     icon: Truck           },
  { to: '/returns',      label: 'Returns',      icon: Package         },
  { to: '/reports',      label: 'Reports',      icon: BarChart3       },
  { to: '/settings',     label: 'Settings',     icon: Settings        },
];

export default function Sidebar() {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="h-screen w-[240px] flex flex-col bg-white border-r border-slate-200 relative z-30 flex-shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {/* Logo */}
      <div className="flex items-center gap-3 py-5 px-4 border-b border-slate-100 min-h-[72px]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center flex-shrink-0 shadow-glow">
          <Package size={18} className="text-white" />
        </div>
        <div className="overflow-hidden whitespace-nowrap">
          <p className="text-sm font-bold text-slate-900 leading-tight">Praveen Trading</p>
          <p className="text-xs text-brand-600 font-semibold">Company</p>
        </div>
      </div>



      {/* Nav Label */}
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-5 pb-1 px-4 whitespace-nowrap overflow-hidden">
        Main Menu
      </p>

      {/* Nav Items Container with its own overflow */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to}>
              {({ isActive }) => (
                <motion.div
                  whileHover={{ x: 2 }}
                  className={`nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}
                >
                  <Icon size={17} className="flex-shrink-0" />
                  <span className="text-sm font-medium whitespace-nowrap overflow-hidden ml-3">
                    {item.label}
                  </span>
                </motion.div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-slate-100 bg-slate-50/60 p-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white shadow-sm">
            {currentUser?.avatar || 'PA'}
          </div>
          <div className="flex-1 overflow-hidden whitespace-nowrap">
            <p className="text-sm font-semibold text-slate-800 truncate">{currentUser?.name}</p>
            <p className="text-xs text-slate-400 truncate">{currentUser?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
