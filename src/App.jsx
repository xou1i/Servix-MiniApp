import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import RoleGuard from './components/RoleGuard';
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

// ── All valid staff roles ──────────────────────────────────────────────────
const ALL_ROLES = ['cashier', 'waiter', 'chef', 'barista'];

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
        {/* ── Role-scoped routes: /{role}/orders, /{role}/history ──────── */}
        {ALL_ROLES.map((r) => (
          <Route
            key={r}
            path={`/${r}`}
            element={<RoleGuard allowedRoles={[r]} currentRole={role} />}
          >
            <Route element={<DashboardLayout roleKey={role} logout={logout} />}>
              <Route path="orders"  element={<OrdersPage roleKey={role} />} />
              <Route path="history" element={<HistoryPage roleKey={role} />} />
              <Route path="tables"  element={<TablesPage />} />
              {/* Cashier-only: bills */}
              {r === 'cashier' && (
                <Route path="bills" element={<CashierBillsPage roleKey={role} />} />
              )}
              {/* Default: redirect /{role} → /{role}/orders */}
              <Route index element={<Navigate to="orders" replace />} />
            </Route>
          </Route>
        ))}

        {/* ── Shared routes (all roles) ────────────────────────────────── */}
        <Route element={<DashboardLayout roleKey={role} logout={logout} />}>
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        {/* ── POS Workspace (waiter/cashier only) ──────────────────────── */}
        <Route
          path="/pos"
          element={
            <RoleGuard allowedRoles={['cashier', 'waiter']} currentRole={role}>
              <OrderPOSWorkspace roleKey={role} />
            </RoleGuard>
          }
        />

        {/* ── Dashboard (admin/manager — future) ──────────────────────── */}
        <Route path="/dashboard" element={<Navigate to={`/${role}/orders`} replace />} />

        {/* ── Root redirect → /{role}/orders ───────────────────────────── */}
        <Route path="/" element={<Navigate to={`/${role}/orders`} replace />} />

        {/* ── Legacy flat routes → redirect to role-prefixed ───────────── */}
        <Route path="/orders"  element={<Navigate to={`/${role}/orders`} replace />} />
        <Route path="/history" element={<Navigate to={`/${role}/history`} replace />} />
        <Route path="/bills"   element={<Navigate to={`/${role}/bills`} replace />} />
        <Route path="/tables"  element={<Navigate to={`/${role}/tables`} replace />} />

        {/* ── Catch-all ────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to={`/${role}/orders`} replace />} />
      </Routes>

      {/* Global modal — accessible on every route including /pos */}
      <OrderContextModal />
    </>
  );
}

export default App;
