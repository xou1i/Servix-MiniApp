import { Clock3, UtensilsCrossed, NotebookPen, X } from 'lucide-react';
import StatusBadge from '../StatusBadge';
import { useAppState } from '../../hooks/useAppState';
import { getNextStatusActions, getActionLabel } from '../../utils/orderWorkflow';
import { DEPARTMENT } from '../../constants/roles';
import { ORDER_STATUS } from '../../utils/status';

/** Maps action status to button accent color */
const ACTION_STYLE = {
  preparing: 'bg-[var(--color-preparing)] text-slate-900',
  ready:     'bg-[var(--color-ready)] text-white',
  completed: 'bg-[var(--color-teal)] text-white',
  cancelled: 'bg-slate-300 text-slate-700',
};

/** Only Chef and Barista can modify order status */
const STATUS_MODIFIERS = ['chef', 'barista'];

/** Only Waiter and Cashier can cancel orders */
const CANCEL_ROLES = ['waiter', 'cashier'];

function OrderCard({ order, roleKey }) {
  const { updateOrderStatus, language } = useAppState();
  const isAr = language !== 'en';

  // Determine which items to show based on role
  let displayItems = order.items;
  if (roleKey === 'chef')    displayItems = order.kitchenItems;
  if (roleKey === 'barista') displayItems = order.baristaItems;

  const canModifyStatus = STATUS_MODIFIERS.includes(roleKey);
  const canCancel = CANCEL_ROLES.includes(roleKey)
    && order.status !== ORDER_STATUS.completed
    && order.status !== ORDER_STATUS.cancelled;
  const nextActions = canModifyStatus ? getNextStatusActions(order.status) : [];
  const minutesLabel = isAr
    ? `منذ ${order.minutesAgo} ${order.minutesAgo === 1 ? 'دقيقة' : 'دقيقة'}`
    : `${order.minutesAgo}m ago`;

  return (
    <article
      className="glass-card h-full animate-slide-up flex flex-col gap-4 rounded-2xl p-5 shadow-[0_2px_12px_rgba(21,28,34,0.07)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(21,28,34,0.12)]"
      style={{ '--delay': '0ms' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 min-w-0">
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-primary)] opacity-75">
            {order.id}
          </p>
          <h3 className="font-headline text-xl font-bold text-[var(--text-primary)] leading-tight">
            {isAr ? `طاولة ${order.table}` : `Table ${order.table}`}
          </h3>
        </div>
        <StatusBadge status={order.status} lang={language} />
      </div>

      {/* Items list */}
      <div className="flex-1 space-y-2">
        {displayItems.length > 0 ? (
          displayItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-primary)]/25" />
              <span className="truncate">{item}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-[var(--text-muted)] italic">
            {isAr ? 'لا توجد أصناف لهذا القسم' : 'No items for this section'}
          </p>
        )}

        {/* Notes */}
        {order.notes ? (
          <div className="mt-3 rounded-xl bg-[var(--surface-low)] p-3">
            <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">
              <NotebookPen size={11} className="inline me-1 opacity-60" />
              "{order.notes}"
            </p>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--surface-high)] pt-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Clock3 size={13} />
            {minutesLabel}
          </span>

          {/* Action buttons — only for Chef/Barista */}
          {nextActions.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-end">
              {nextActions
                .filter((s) => s !== 'cancelled') // hide cancel for cleaner UI
                .map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateOrderStatus(order.id, status)}
                    className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-[0.72rem] font-bold transition-all duration-200 ease-out hover:scale-[1.03] active:scale-95 ${ACTION_STYLE[status] ?? 'bg-slate-200 text-slate-700'}`}
                  >
                    {getActionLabel(status, language)}
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Cancel button — only for Waiter/Cashier (left side in RTL) */}
        {canCancel && (
          <button
            type="button"
            onClick={() => updateOrderStatus(order.id, ORDER_STATUS.cancelled)}
            className="cancel-order-btn cursor-pointer flex items-center gap-1 rounded-lg px-2.5 py-1 text-[0.7rem] font-bold transition-all duration-200 ease-out active:scale-95"
            style={{ background: '#EDF4FD', color: 'var(--text-muted)', border: '1px solid transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.borderColor = '#FECACA'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#EDF4FD'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'transparent'; }}
          >
            <X size={12} strokeWidth={2.5} />
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
        )}
      </div>
    </article>
  );
}

export default OrderCard;
