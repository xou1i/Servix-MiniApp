// OrderGrid.jsx
import OrderCard from './OrderCard';
import { useAppState } from '../../hooks/useAppState';

function OrderGrid({ orders, roleKey }) {
  const { language } = useAppState();
  const isAr = language !== 'en';

  if (orders.length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl bg-[var(--surface-low)] py-12 text-center">
        <p className="text-lg font-semibold text-[var(--text-secondary)]">
          {isAr ? 'لا توجد طلبات' : 'No orders'}
        </p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {isAr ? 'ستظهر هنا الطلبات الجديدة عند وصولها' : 'New orders will appear here'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {orders.map((order, index) => (
        <div
          key={order.id}
          className="animate-slide-up stagger h-full"
          style={{ '--delay': `${Math.min(index, 10) * 50}ms` }}
        >
          <OrderCard order={order} roleKey={roleKey} />
        </div>
      ))}
    </div>
  );
}

export default OrderGrid;
