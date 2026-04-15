import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import { useAppState } from './hooks/useAppState';
import { useAuth } from './hooks/useAuth';

import LoginPage          from './pages/LoginPage';
import OrdersPage         from './pages/OrdersPage';
import HistoryPage        from './pages/HistoryPage';
import NotificationsPage  from './pages/NotificationsPage';
import OrderPOSWorkspace  from './features/orders/OrderPOSWorkspace';
import CashierBillsPage   from './pages/CashierBillsPage';
import TablesPage         from './pages/TablesPage';
import OrderContextModal  from './features/orders/components/shared/OrderContextModal';

function App() {
  const { login, logout, role } = useAuth();
  const { language } = useAppState();

  useEffect(() => {
    document.documentElement.dir  = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Not logged in → show 2-step login page
  if (!role) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <>
      <Routes>
        <Route element={<DashboardLayout roleKey={role} logout={logout} />}>
          <Route path="/"              element={<Navigate to="/orders" replace />} />
          <Route path="/orders"        element={<OrdersPage roleKey={role} />} />
          <Route path="/history"       element={<HistoryPage roleKey={role} />} />
          <Route path="/bills"         element={<CashierBillsPage roleKey={role} />} />
          <Route path="/tables"        element={<TablesPage />} />
          <Route path="/menu"          element={<Navigate to="/orders" replace />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        {/* Standalone POS Workspace */}
        <Route path="/pos" element={<OrderPOSWorkspace roleKey={role} />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/orders" replace />} />
      </Routes>

      {/* Global modal — accessible on every route including /pos */}
      <OrderContextModal />
    </>
  );
}

export default App;
