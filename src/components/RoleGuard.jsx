import { Navigate, Outlet } from 'react-router-dom';

/**
 * RoleGuard — Route guard that restricts access by user role.
 *
 * Usage:
 *   <Route element={<RoleGuard allowedRoles={['cashier','waiter']} currentRole={role} />}>
 *     <Route path="orders" element={<OrdersPage />} />
 *   </Route>
 *
 *   Or with children:
 *   <Route path="/pos" element={
 *     <RoleGuard allowedRoles={['cashier','waiter']} currentRole={role}>
 *       <OrderPOSWorkspace />
 *     </RoleGuard>
 *   } />
 *
 * @param {string[]} allowedRoles - Array of role keys that can access this route
 * @param {string} currentRole - The authenticated user's role key (lowercase)
 * @param {React.ReactNode} [children] - Optional children (if not using Outlet)
 */
export default function RoleGuard({ allowedRoles, currentRole, children }) {
  // No role at all means not authenticated — parent handles login redirect
  if (!currentRole) {
    return <Navigate to="/" replace />;
  }

  // Role not in allowed list → redirect to their own home
  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to={`/${currentRole}/orders`} replace />;
  }

  // Authorized — render children or nested routes
  return children || <Outlet />;
}
