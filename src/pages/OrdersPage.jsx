import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import OrderGrid from '../components/orders/OrderGrid';
import OrdersFilterBar from '../components/orders/OrdersFilterBar';
import MenuSelector from '../components/orders/MenuSelector';
import { useAppState } from '../hooks/useAppState';
import { filterOrders, resolveDepartmentScope } from '../utils/orderFilters';
import { ROLES } from '../constants/roles';
import { ORDER_STATUS } from '../utils/status';

const COMPLETED_STATUSES = [ORDER_STATUS.completed, ORDER_STATUS.cancelled];

function OrdersPage({ roleKey }) {
  const { orders, language } = useAppState();
  const isAr = language !== 'en';
  const [statusFilter, setStatusFilter] = useState('all');
  const [showMenu, setShowMenu] = useState(false);

  const departmentKey = useMemo(() => resolveDepartmentScope(roleKey, 'auto'), [roleKey]);

  // Filter out completed orders (they belong in History)
  const activeOrders = useMemo(
    () => orders.filter((o) => !COMPLETED_STATUSES.includes(o.status)),
    [orders],
  );

  const filteredOrders = useMemo(
    () => filterOrders(activeOrders, { normalizedQuery: '', statusFilter, departmentKey }),
    [activeOrders, statusFilter, departmentKey],
  );

  const role = ROLES[roleKey];

  return (
    <section className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold text-[var(--text-primary)]">
            {isAr ? 'الطلبات النشطة' : 'Active Orders'}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {isAr
              ? 'إدارة الطلبات الواردة لحظياً'
              : 'Real-time order management'}
          </p>
        </div>

        {/* Waiter/Cashier: create order button */}
        {(roleKey === 'waiter' || roleKey === 'cashier') && (
          <button
            type="button"
            onClick={() => setShowMenu(true)}
            className="btn-primary shrink-0"
          >
            <Plus size={16} />
            {isAr ? 'طلب جديد' : 'New Order'}
          </button>
        )}
      </div>

      {/* Filter chips */}
      <OrdersFilterBar
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        resultCount={filteredOrders.length}
      />

      {/* Orders grid */}
      <OrderGrid orders={filteredOrders} roleKey={roleKey} />

      {/* Menu selector modal */}
      {showMenu && <MenuSelector onClose={() => setShowMenu(false)} />}
    </section>
  );
}

export default OrdersPage;
