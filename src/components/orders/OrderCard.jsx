// OrderCard.jsx
import { Clock3, NotebookPen, X, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../StatusBadge';
import { useAppState } from '../../hooks/useAppState';
import { getNextStatusActions, getActionLabel } from '../../utils/orderWorkflow';
import { DEPARTMENT } from '../../constants/roles';
import { ORDER_STATUS } from '../../utils/status';

/** Only Waiter and Cashier can cancel orders */
const CANCEL_ROLES = ['waiter', 'cashier'];

/** Format minutes into a readable string */
function formatTimeAgo(minutes, isAr) {
  if (!minutes || minutes <= 0) return isAr ? 'الآن' : 'Just now';
  if (minutes < 60) return isAr ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) {
    if (mins === 0) return isAr ? `منذ ${hours} ساعة` : `${hours}h ago`;
    return isAr ? `منذ ${hours} ساعة و ${mins} دقيقة` : `${hours}h ${mins}m ago`;
  }
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  if (remHours === 0) return isAr ? `منذ ${days} يوم` : `${days}d ago`;
  return isAr ? `منذ ${days} يوم و ${remHours} ساعة` : `${days}d ${remHours}h ago`;
}

function OrderCard({ order, roleKey }) {
  const { updateOrderStatus, updateDepartmentStatus, language } = useAppState();
  const isAr = language !== 'en';

  // Determine which items to show based on role
  let displayItems = order.items || [];
  if (roleKey === 'chef') displayItems = order.kitchenItems || [];
  if (roleKey === 'barista') displayItems = order.baristaItems || [];

  // ONLY Chef and Barista can modify order status
  const canModifyStatus = ['chef', 'barista'].includes(roleKey);

  // ONLY Waiter and Cashier can cancel
  const canCancel = CANCEL_ROLES.includes(roleKey)
    && order.status !== ORDER_STATUS.paid
    && order.status !== ORDER_STATUS.cancelled;

  // Action buttons ONLY for chef/barista
  let nextActions = [];
  if (canModifyStatus) {
    if (['chef', 'barista'].includes(roleKey)) {
      const myDepartmentStatus = roleKey === 'chef' ? order.kitchenStatus : order.baristaStatus;
      nextActions = getNextStatusActions(myDepartmentStatus || order.status);
    }
  }

  const handleModifyStatus = (nextStatus) => {
    if (roleKey === 'chef') {
      updateDepartmentStatus(order.id, 'kitchen', nextStatus);
    } else if (roleKey === 'barista') {
      updateDepartmentStatus(order.id, 'barista', nextStatus);
    }
  };

  // ── Display formatting ────────────────────────────────────────────────
  const displayNumber = order.orderNumber
    ? `ORD-${order.orderNumber}`
    : `ORD-${(order.id || '').split('-')[0].toUpperCase()}`;

  const tableCode = order.tableNumber || order.code || order.table;
  const timeLabel = formatTimeAgo(order.minutesAgo, isAr);

  return (
    <article
      className="bg-white flex flex-col rounded-[1.2rem] shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100 transition-all duration-300 hover:shadow-[0_6px_20px_rgba(0,0,0,0.09)] overflow-hidden h-full"
      dir="rtl"
    >
      {/* ── 1. Header Bar ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100/80 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="font-extrabold text-[13px] text-slate-700 tracking-wide">
            {displayNumber}
          </span>
          {order.type && (
            <span
              className="px-2.5 py-[3px] rounded-md text-[10px] font-bold shrink-0 border"
              style={{
                backgroundColor:
                  order.type === 'dine-in' ? '#EFF6FF' :
                  order.type === 'takeaway' ? '#FFFBEB' :
                  order.type === 'delivery' ? '#F5F3FF' : '#f8fafc',
                color:
                  order.type === 'dine-in' ? '#1E3A8A' :
                  order.type === 'takeaway' ? '#D97706' :
                  order.type === 'delivery' ? '#6D28D9' : '#64748b',
                borderColor:
                  order.type === 'dine-in' ? '#DBEAFE' :
                  order.type === 'takeaway' ? '#FEF3C7' :
                  order.type === 'delivery' ? '#EDE9FE' : '#e2e8f0',
              }}
            >
              {order.type === 'dine-in'   ? (isAr ? 'صالة'  : 'Dine-In') :
               order.type === 'takeaway'  ? (isAr ? 'سفري'  : 'Takeaway') :
               order.type === 'delivery'  ? (isAr ? 'توصيل' : 'Delivery') : ''}
            </span>
          )}
        </div>
        <div className="shrink-0">
          <StatusBadge status={order.status} lang={language} />
        </div>
      </div>

      {/* ── 2. Body ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col px-5 py-4 gap-2 bg-white">

        {/* Table badge (Dine-In only) */}
        {order.type === 'dine-in' && tableCode && (
          <div className="flex justify-start mb-1">
            <span className="inline-flex items-center bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-800 font-extrabold text-[12px] shadow-sm">
              {isAr ? `طاولة T${tableCode}` : `Table T${tableCode}`}
            </span>
          </div>
        )}

        {/* Items list */}
        <div className="flex-1 flex flex-col gap-2">
          {displayItems.length > 0 ? (
            displayItems.map((item, i) => {
              let isItemReady = false;
              if (roleKey === 'waiter' || roleKey === 'cashier') {
                const isKitchenItem = order.kitchenItems?.includes(item);
                const isBaristaItem = order.baristaItems?.includes(item);
                if (isKitchenItem && order.kitchenStatus === ORDER_STATUS.ready) isItemReady = true;
                if (isBaristaItem && order.baristaStatus === ORDER_STATUS.ready) isItemReady = true;
                if (['ready', 'served', 'billed', 'paid'].includes(order.status)) isItemReady = true;
              }

              return (
                <div key={i} className="flex items-start gap-2.5 transition-colors">
                  {isItemReady ? (
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-[2px]" />
                  ) : (
                    <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-slate-300 mt-[7px]" />
                  )}
                  <span className={`font-bold text-[13.5px] leading-snug whitespace-normal ${
                    isItemReady ? 'text-emerald-600 line-through opacity-60' : 'text-slate-800'
                  }`}>
                    {item}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-[12px] text-slate-400 font-semibold">
              {isAr ? 'لا توجد أصناف لهذا القسم' : 'No items for this section'}
            </p>
          )}

          {/* Notes card */}
          {order.notes && (
            <div className="mt-auto pt-2">
              <div className="rounded-xl py-2.5 px-3.5 bg-slate-50/80 border border-slate-100">
                <p className="text-[11.5px] font-bold leading-relaxed flex gap-2 items-start text-slate-500">
                  <NotebookPen size={13} className="shrink-0 mt-[1px]" />
                  <span className="whitespace-normal leading-snug">"{order.notes}"</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Footer Bar ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100/80 bg-white shrink-0">
        {/* Right (RTL): Time */}
        <span className="flex items-center gap-1.5 text-[11.5px] font-bold text-slate-400 shrink-0">
          <Clock3 size={13} strokeWidth={2.5} />
          {timeLabel}
        </span>

        {/* Left (RTL): Actions — ONLY for chef/barista */}
        <div className="flex items-center gap-2 shrink-0">
          {nextActions.length > 0 && nextActions
            .filter((s) => s !== 'cancelled')
            .map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => handleModifyStatus(status)}
                className={`whitespace-nowrap cursor-pointer rounded-lg px-3.5 py-2 text-[11px] font-black shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                  status === ORDER_STATUS.ready
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : status === ORDER_STATUS.served
                    ? 'bg-[#1D4E89] hover:bg-[#163d6b] text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {getActionLabel(status, language)}
              </button>
            ))
          }

          {/* Cancel — ONLY for waiter/cashier */}
          {canCancel && (
            <button
              type="button"
              onClick={() => updateOrderStatus(order.id, ORDER_STATUS.cancelled)}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors bg-transparent border-none"
            >
              <X size={13} strokeWidth={2.5} />
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default OrderCard;
