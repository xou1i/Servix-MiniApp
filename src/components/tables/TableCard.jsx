import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '../../features/orders/store/useOrderStore';

const STATUS_STYLES = {
  Available: 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300 shadow-emerald-100/50',
  Occupied: 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100 hover:border-rose-300 shadow-rose-100/50',
  Reserved: 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 hover:border-amber-300 shadow-amber-100/50',
  Maintenance: 'bg-slate-100 border-slate-200 text-slate-500',
};

const STATUS_BADGE = {
  Available: 'bg-emerald-500 text-white',
  Occupied: 'bg-rose-500 text-white',
  Reserved: 'bg-amber-500 text-white',
  Maintenance: 'bg-slate-500 text-white',
};

const STATUS_LABELS = {
  Available: 'متاح',
  Occupied: 'مشغول',
  Reserved: 'محجوز',
  Maintenance: 'صيانة',
};

export default function TableCard({ table }) {
  const navigate = useNavigate();
  const { setContext } = useOrderStore();

  const disabled = !table.isOrderingEnabled;

  const handleClick = () => {
    if (disabled) return;

    if (table.status === 'Available') {
      // Start new order
      setContext({ type: 'dine-in', tableId: table.id, delivery: null });
      navigate('/pos');
    } else if (table.status === 'Occupied') {
      // Open existing order - In a real app we might pass filter params to the orders page
      // Here we just navigate to orders page where active orders are seen
      navigate('/orders');
    }
    // Reserved might do something else (e.g., prompt to check-in reservation)
  };

  const styleClasses = disabled ? STATUS_STYLES.Maintenance : (STATUS_STYLES[table.status] || STATUS_STYLES.Available);
  const badgeClasses = STATUS_BADGE[table.status] || STATUS_BADGE.Available;

  return (
    <div
      onClick={handleClick}
      className={`
        relative p-4 rounded-2xl border-2 transition-all duration-300 
        flex flex-col items-center justify-center gap-3 min-h-[140px]
        ${styleClasses}
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1 hover:shadow-lg'}
      `}
    >
      {/* Active Orders Badge */}
      {table.activeOrdersCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white skeleton-pulse-light">
          {table.activeOrdersCount}
        </div>
      )}

      {/* Main Table Content */}
      <h3 className="text-3xl font-black drop-shadow-sm tracking-tighter">
        T{table.tableNumber}
      </h3>

      {/* Capacity & Status */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${badgeClasses} uppercase tracking-wider`}>
          {STATUS_LABELS[table.status] || table.status}
        </span>

        <div className="flex items-center gap-1 text-xs font-bold opacity-80 mt-1">
          <Users size={12} />
          <span>{table.capacity} مقاعد</span>
        </div>
      </div>
    </div>
  );
}
