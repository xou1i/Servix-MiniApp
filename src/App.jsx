import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import { useRole } from './hooks/useRole';
import { useAppState } from './hooks/useAppState';
import LoginPage from './pages/LoginPage';
import OrdersPage from './pages/OrdersPage';
import HistoryPage from './pages/HistoryPage';
import NotificationsPage from './pages/NotificationsPage';
import OrderPOSWorkspace from './features/orders/OrderPOSWorkspace';
import CashierBillsPage from './pages/CashierBillsPage';


function App() {
  const { role, setRole, logout } = useRole();
  const { language } = useAppState();

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  if (!role) {
    return <LoginPage setRole={setRole} />;
  }

  return (
    <Routes>
      <Route element={<DashboardLayout roleKey={role} logout={logout} />}>
        <Route path="/" element={<Navigate to="/orders" replace />} />
        <Route path="/orders" element={<OrdersPage roleKey={role} />} />
        <Route path="/history" element={<HistoryPage roleKey={role} />} />
        <Route path="/bills" element={<CashierBillsPage roleKey={role} />} />
        {/* Tables & Menu are placeholders — redirect to orders for now */}
        <Route path="/tables" element={<Navigate to="/orders" replace />} />
        <Route path="/menu" element={<Navigate to="/orders" replace />} />
        <Route path="/notifications" element={<NotificationsPage />} />

      </Route>
      {/* Standalone POS Workspace replacing strict DashboardLayout bounds */}
      <Route path="/pos" element={<OrderPOSWorkspace roleKey={role} />} />
      
      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/orders" replace />} />
    </Routes>
  );
}

export default App;
