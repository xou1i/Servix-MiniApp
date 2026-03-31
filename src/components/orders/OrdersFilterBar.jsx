import { useAppState } from '../../hooks/useAppState';

const FILTERS = {
  ar: [
    { key: 'all',       label: 'الكل' },
    { key: 'pending',   label: 'قيد الانتظار' },
    { key: 'preparing', label: 'قيد التحضير' },
    { key: 'ready',     label: 'جاهز' },
  ],
  en: [
    { key: 'all',       label: 'All' },
    { key: 'pending',   label: 'Pending' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready',     label: 'Ready' },
  ],
};

const ACTIVE_COLOR = {
  all:       'bg-white text-[var(--color-primary)] shadow-sm',
  pending:   'bg-white text-[#495057] shadow-sm',
  preparing: 'bg-[var(--color-preparing)] text-slate-900 shadow-sm',
  ready:     'bg-[var(--color-ready)] text-white shadow-sm',
};

function OrdersFilterBar({ statusFilter, onStatusChange, resultCount }) {
  const { language } = useAppState();
  const isAr = language !== 'en';
  const filters = FILTERS[language] ?? FILTERS.ar;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 rounded-xl bg-[var(--surface-mid)] p-1.5">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onStatusChange(f.key)}
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
        {isAr ? `${resultCount} طلب` : `${resultCount} orders`}
      </p>
    </div>
  );
}

export default OrdersFilterBar;
