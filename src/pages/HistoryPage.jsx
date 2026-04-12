import { useMemo, useState } from 'react';
import { Clock } from 'lucide-react';
import OrderCard from '../components/orders/OrderCard';
import { useAppState } from '../hooks/useAppState';
import { ORDER_STATUS } from '../utils/status';

const COMPLETED_STATUSES = [ORDER_STATUS.completed, ORDER_STATUS.cancelled];

const FILTERS = {
  ar: [
    { key: 'all',       label: 'الكل' },
    { key: 'completed',  label: 'مكتمل' },
    { key: 'cancelled', label: 'ملغي' },
  ],
  en: [
    { key: 'all',       label: 'All' },
    { key: 'completed',  label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ],
};

const ACTIVE_COLOR = {
  all:       'bg-white text-[var(--color-primary)] shadow-sm',
  completed: 'bg-[var(--color-teal)] text-white shadow-sm',
  cancelled: 'bg-slate-400 text-white shadow-sm',
};

function HistoryPage({ roleKey }) {
  const { orders, language } = useAppState();
  const isAr = language !== 'en';
  const [statusFilter, setStatusFilter] = useState('all');

  const completedOrders = useMemo(() => {
    let filtered = orders.filter((o) => COMPLETED_STATUSES.includes(o.status));
    if (statusFilter !== 'all') {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }
    return filtered;
  }, [orders, statusFilter]);

  const filters = FILTERS[language] ?? FILTERS.ar;

  return (
    <section className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="font-headline text-2xl font-bold text-[var(--text-primary)]">
          {isAr ? 'سجل الطلبات' : 'Order History'}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {isAr
            ? 'الطلبات المكتملة والملغية'
            : 'Completed and cancelled orders'}
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 rounded-xl bg-[var(--surface-mid)] p-1.5">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(f.key)}
              className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-sm font-bold transition-all duration-200 ease-out ${
                statusFilter === f.key
                  ? ACTIVE_COLOR[f.key]
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--text-muted)] font-medium">
          {isAr ? `${completedOrders.length} طلب` : `${completedOrders.length} orders`}
        </p>
      </div>

      {/* Orders grid */}
      {completedOrders.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl bg-[var(--surface-low)] py-12 text-center">
          <Clock size={32} className="text-[var(--text-muted)] mb-3 opacity-50" />
          <p className="text-lg font-semibold text-[var(--text-secondary)]">
            {isAr ? 'لا يوجد سجل' : 'No history'}
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {isAr ? 'ستظهر هنا الطلبات المكتملة' : 'Completed orders will appear here'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {completedOrders.map((order, index) => (
            <div
              key={order.id}
              className="history-card animate-slide-up stagger h-full"
              style={{ '--delay': `${Math.min(index, 10) * 50}ms` }}
            >
              <OrderCard order={order} roleKey={roleKey} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default HistoryPage;
