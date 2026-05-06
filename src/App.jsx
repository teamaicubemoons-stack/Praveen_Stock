import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useStore from './store/useStore';

// Layout
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login       from './pages/Login';
import Dashboard   from './pages/Dashboard';
import StockInward from './pages/StockInward';
import Verification from './pages/Verification';
import SKUGenerator from './pages/SKUGenerator';
import Inventory   from './pages/Inventory';
import Warehouse   from './pages/Warehouse';
import Orders      from './pages/Orders';
import Picking     from './pages/Picking';
import Dispatch    from './pages/Dispatch';
import Returns     from './pages/Returns';
import Reports     from './pages/Reports';
import Settings    from './pages/Settings';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useStore();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Check if store is already hydrated or wait for it
    const checkHydration = () => {
      const state = useStore.getState();
      // Since we don't have a complex hydration flag in the store yet, 
      // we check if we can access the persisted state or just wait a frame
      setHydrated(true);
    };
    checkHydration();
  }, []);

  if (!hydrated) return null;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={
          <PublicRoute><Login /></PublicRoute>
        } />

        {/* Protected */}
        <Route path="/" element={
          <PrivateRoute><DashboardLayout /></PrivateRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"    element={<Dashboard />}   />
          <Route path="inward"       element={<StockInward />} />
          <Route path="verification" element={<Verification />} />
          <Route path="sku"          element={<SKUGenerator />} />
          <Route path="inventory"    element={<Inventory />}   />
          <Route path="warehouse"    element={<Warehouse />}   />
          <Route path="orders"       element={<Orders />}      />
          <Route path="picking"      element={<Picking />}     />
          <Route path="dispatch"     element={<Dispatch />}    />
          <Route path="returns"      element={<Returns />}     />
          <Route path="reports"      element={<Reports />}     />
          <Route path="settings"     element={<Settings />}    />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
