import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Bell, Palette, Save, Check } from 'lucide-react';
import useStore from '../store/useStore';

const ROLES = [
  { id: 'admin',   name: 'Admin',           desc: 'Full access to all modules' },
  { id: 'manager', name: 'Warehouse Manager', desc: 'Inventory, warehouse, dispatch' },
  { id: 'sales',   name: 'Sales Executive', desc: 'Orders and customer management' },
  { id: 'viewer',  name: 'Viewer',          desc: 'Read-only access' },
];

const USERS_MOCK = [
  { id: 'U1', name: 'Praveen Trading Co.garwal', email: 'praveen@praveentrading.com', role: 'admin', active: true },
  { id: 'U2', name: 'Raj Sharma',      email: 'raj@praveentrading.com',     role: 'manager', active: true },
  { id: 'U3', name: 'Meena Gupta',     email: 'meena@praveentrading.com',   role: 'sales', active: false },
];

function Section({ title, icon: Icon, children }) {
  return (
    <div className="section-card">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
          <Icon size={15} className="text-brand-600" />
        </div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const { currentUser } = useStore();
  const [profile, setProfile] = useState({
    name: currentUser?.name || 'Praveen Trading Co.garwal',
    email: currentUser?.email || 'praveen@praveentrading.com',
    phone: '+91 98765 00001',
    company: 'Praveen Trading Co.',
  });
  const [saved, setSaved] = useState(false);
  const [notifs, setNotifs] = useState({ lowStock: true, newOrder: true, dispatch: true, returns: false });
  const [users] = useState(USERS_MOCK);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account, preferences, and system configuration</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Profile */}
        <Section title="Profile Settings" icon={User}>
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                PA
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{profile.name}</p>
                <p className="text-xs text-slate-500 font-medium">Administrator</p>
                <button className="text-xs text-brand-600 font-semibold hover:text-brand-700 mt-1 transition-colors">Change photo</button>
              </div>
            </div>
            {[
              ['Full Name', 'name', 'text'],
              ['Email Address', 'email', 'email'],
              ['Phone Number', 'phone', 'tel'],
              ['Company Name', 'company', 'text'],
            ].map(([label, field, type]) => (
              <div key={field}>
                <label className="label">{label}</label>
                <input
                  type={type}
                  value={profile[field]}
                  onChange={(e) => setProfile((p) => ({ ...p, [field]: e.target.value }))}
                  className="input-field"
                />
              </div>
            ))}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleSave}
              className="btn-primary"
            >
              {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
            </motion.button>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notification Preferences" icon={Bell}>
          <div className="space-y-4">
            {[
              ['lowStock',  'Low Stock Alerts',      'Get notified when products fall below threshold'],
              ['newOrder',  'New Order Received',     'Notification on every new order created'],
              ['dispatch',  'Dispatch Updates',       'Confirm when orders are dispatched'],
              ['returns',   'Return Requests',        'Alert when a return request is submitted'],
            ].map(([key, label, desc]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{label}</p>
                  <p className="text-xs text-slate-500 font-medium">{desc}</p>
                </div>
                <button
                  onClick={() => setNotifs((n) => ({ ...n, [key]: !n[key] }))}
                  className={`w-11 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ${notifs[key] ? 'bg-brand-600' : 'bg-slate-200'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 shadow-sm transition-all duration-300 ${notifs[key] ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </Section>

        {/* User Roles */}
        <Section title="User Roles & Permissions" icon={Shield}>
          <div className="space-y-3 mb-4">
            {ROLES.map((role) => (
              <div key={role.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  role.id === 'admin' ? 'bg-brand-600' :
                  role.id === 'manager' ? 'bg-purple-600' :
                  role.id === 'sales' ? 'bg-amber-600' : 'bg-slate-400'
                }`} />
                <div>
                  <p className="text-sm font-bold text-slate-900">{role.name}</p>
                  <p className="text-xs text-slate-500 font-medium">{role.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Team Members</p>
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-xs font-bold text-brand-600 flex-shrink-0">
                    {user.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 font-medium truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight ${
                      user.role === 'admin' ? 'bg-brand-50 text-brand-600' :
                      user.role === 'manager' ? 'bg-purple-50 text-purple-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {user.role}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* System Info */}
        <Section title="System Information" icon={Palette}>
          <div className="space-y-3">
            {[
              ['Application', 'Praveen Trading Co. WMS'],
              ['Version', 'v1.0.0'],
              ['Build Date', 'May 2026'],
              ['Environment', 'Production'],
              ['License', 'Enterprise'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-xs text-slate-500 font-medium">{label}</span>
                <span className="text-xs font-bold text-slate-700">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-brand-50 border border-brand-100 rounded-xl shadow-sm">
            <p className="text-xs text-brand-600 font-bold uppercase tracking-wider">Frontend-only demo mode</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">All data is stored in local session state</p>
          </div>
        </Section>
      </div>
    </div>
  );
}
