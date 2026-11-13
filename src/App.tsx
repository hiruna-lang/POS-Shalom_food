import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PosProvider } from './context/PosContext';
import { Navbar } from './components/layout/Navbar';
import { ToastContainer } from './components/common/ToastContainer';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { PosPage } from './pages/PosPage';
import { OrdersPage } from './pages/OrdersPage';
import { MenuPage } from './pages/MenuPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  if (isHomePage) {
    return (
      <div className="h-screen h-[100dvh] w-screen overflow-hidden bg-[#f4f6fa] select-none overscroll-none">
        <DashboardPage />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800">
      {/* Top Navigation Header with prominent Back to Dashboard button */}
      <Navbar />

      {/* Full-width Main Content Area (Sidebar removed for maximum POS screen workspace) */}
      <main className="flex-1 overflow-y-auto bg-slate-100 relative">
        <Routes>
          <Route path="/pos" element={<PosPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Floating Notifications Toast Container */}
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <PosProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </Router>
    </PosProvider>
  );
};

export default App;
