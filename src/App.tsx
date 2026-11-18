import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PosProvider, usePos } from './context/PosContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PosPage } from './pages/PosPage';
import { OrdersPage } from './pages/OrdersPage';
import { MenuPage } from './pages/MenuPage';
import { ReportsPage } from './pages/ReportsPage';
import { usePreferences } from './utils/preferences';
import { SettingsPage } from './pages/SettingsPage';

function AppContent() {
  const { isAuthenticated, currentUser } = usePos();
  const preferences = usePreferences();
  if (!isAuthenticated) return <><LoginPage /><ToastContainer /></>;

  const admin = currentUser.role === 'admin';
  const management = currentUser.role !== 'cashier';
  const denied = <Navigate to="/pos" replace />;

  return (
    <div className="workspace-shell" data-compact={preferences.compact} data-reduced-motion={preferences.reducedMotion}>
      <Navbar />
      <div className="workspace-body">
        <Sidebar />
        <main className="workspace-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/pos" element={<PosPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/menu" element={management ? <MenuPage /> : denied} />
            <Route path="/reports" element={management ? <ReportsPage /> : denied} />
            <Route path="/staff" element={admin ? <SettingsPage key="staff" initialTab="users" /> : denied} />
            <Route path="/settings" element={admin ? <SettingsPage key="settings" /> : denied} />
            <Route path="*" element={<Navigate to={management ? '/' : '/pos'} replace />} />
          </Routes>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

export function App() {
  return <PosProvider><BrowserRouter><AppContent /></BrowserRouter></PosProvider>;
}

export default App;
