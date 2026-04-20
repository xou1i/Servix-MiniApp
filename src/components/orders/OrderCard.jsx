// OrderCard.jsx
import { Clock3, NotebookPen, X, CheckCircle2, Truck, ExternalLink, MapPin } from 'lucide-react';
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

  // ── Determine which items to show based on role's department ─────────
  // Uses _rawItems (full backend objects) with departmentName as the key
  const rawItems = order._rawItems || [];

  let displayItems;
  if (roleKey === 'chef') {
    // Kitchen screen: only items resolved as kitchen department
    displayItems = rawItems.filter(ri => ri._deptKey === 'kitchen');
  } else if (roleKey === 'barista') {
    // Barista screen: only items resolved as barista department
    displayItems = rawItems.filter(ri => ri._deptKey === 'barista');
  } else {
    // Waiter / Cashier: see the full order (all items)
    displayItems = rawItems;
  }

  // Fallback: if _rawItems is empty but we have string items, use those
  const useStringFallback = displayItems.length === 0 && (order.items || []).length > 0 && rawItems.length === 0;
  const fallbackItems = useStringFallback
    ? (roleKey === 'chef' ? (order.kitchenItems || []) :
      roleKey === 'barista' ? (order.baristaItems || []) :
        (order.items || []))
    : [];

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

  // Department badge colors (uses _deptKey for reliable matching)
  const deptBadge = (deptKey) => {
    if (deptKey === 'kitchen') return { bg: '#D6FFFB', color: '#1FA89B', label: isAr ? 'مطبخ' : 'Kitchen' };
    if (deptKey === 'barista') return { bg: '#EDE9FE', color: '#5B21B6', label: isAr ? 'باريستا' : 'Barista' };
    return { bg: '#F1F5F9', color: '#475569', label: '' };
  };

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
              {order.type === 'dine-in' ? (isAr ? 'صالة' : 'Dine-In') :
                order.type === 'takeaway' ? (isAr ? 'سفري' : 'Takeaway') :
                order.type === 'delivery' ? (isAr ? 'توصيل' : 'Delivery') : ''}
            </span>
          )}
          {order._sourceLabel && (
            <span className="px-2 py-[3px] rounded-md text-[10px] font-black shrink-0 bg-slate-800 text-white shadow-sm">
              {isAr ? 'مستورد' : 'Imported'}· {order._sourceLabel}
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

        {/* Items list — uses raw item objects with departmentName */}
        <div className="flex-1 flex flex-col gap-2">
          {displayItems.length > 0 ? (
            displayItems.map((item, i) => {
              const itemName = item.menuItemName || item.name || 'صنف';
              const qty = item.quantity || 1;
              const dept = deptBadge(item._deptKey);
              const showDeptBadge = roleKey === 'waiter' || roleKey === 'cashier';

              // Check ready state for waiter/cashier
              let isItemReady = false;
              if (showDeptBadge) {
                if (item._deptKey === 'kitchen' && order.kitchenStatus === ORDER_STATUS.ready) isItemReady = true;
                if (item._deptKey === 'barista' && order.baristaStatus === ORDER_STATUS.ready) isItemReady = true;
                if (['ready', 'served', 'billed', 'paid'].includes(order.status)) isItemReady = true;
              }

              return (
                <div key={i} className="flex items-center gap-2.5 transition-colors">
                  {isItemReady ? (
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                  ) : (
                    <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-slate-300 mt-[1px]" />
                  )}
                  <span className={`font-bold text-[13.5px] leading-snug whitespace-normal ${isItemReady ? 'text-emerald-600 line-through opacity-60' : 'text-slate-800'
                    }`}>
                    {qty > 1 ? `${qty}x ` : ''}{itemName}
                  </span>
                  {showDeptBadge && item._deptKey && (
                    <span
                      className="px-1.5 py-[1px] rounded text-[9px] font-bold shrink-0 mr-auto"
                      style={{ backgroundColor: dept.bg, color: dept.color }}
                    >
                      {dept.label}
                    </span>
                  )}
                </div>
              );
            })
          ) : useStringFallback && fallbackItems.length > 0 ? (
            fallbackItems.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 transition-colors">
                <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-slate-300 mt-[7px]" />
                <span className="font-bold text-[13.5px] leading-snug whitespace-normal text-slate-800">
                  {item}
                </span>
              </div>
            ))
          ) : (
            <div className="py-6 px-4 border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center text-center">
              <NotebookPen size={20} className="text-slate-300 mb-2" />
              <p className="text-[12px] font-bold text-slate-400">
                {isAr ? 'لا توجد أصناف لهذا القسم' : 'No items for this department'}
              </p>
              {order._isTeam6 && (
                <p className="text-[10px] text-slate-400 mt-1">
                  {isAr ? 'بيانات مستوردة فقط' : 'External metadata only'}
                </p>
              )}
            </div>
          )}

          {/* Notes Section with cleaning */}
          {order.notes && (
            <div className="mt-auto pt-3 border-t border-slate-50">
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100/50 flex flex-col gap-1.5 min-h-[50px] relative">
                <NotebookPen className="absolute top-2.5 left-3 text-slate-300" size={14} />
                
                <div className="text-[11.5px] font-black text-slate-700 leading-relaxed pr-1 overflow-hidden">
                  {order.notes.split('\n').map((line, idx) => {
                    // Clean up technical lines if needed
                    if (line.includes('Imported from Team6')) return null;
                    return <div key={idx} className="mb-0.5">{line}</div>;
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Footer Bar ──────────────────────────────────────────────── */}
      <div className="flex flex-col px-5 py-3 border-t border-slate-100/80 bg-white shrink-0">
        <div className="flex items-center justify-between w-full mb-2">
          {/* Time Label */}
          <span className="flex items-center gap-1.5 text-[11.5px] font-bold text-slate-400 shrink-0">
            <Clock3 size={13} strokeWidth={2.5} />
            {timeLabel}
          </span>
        </div>

        {/* Delivery Details (Sendy / External) - Cashier & Waiter Only */}
        {order.type === 'delivery' && (roleKey === 'waiter' || roleKey === 'cashier') && (
          <div className="mb-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-black text-slate-500">
                <Truck size={14} />
                {isAr ? 'حالة التوصيل:' : 'Delivery Status:'}
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                order.externalDeliveryStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                order.externalDeliveryStatus === 'On the way' ? 'bg-blue-100 text-blue-700' :
                'bg-slate-200 text-slate-700'
              }`}>
                {order.externalDeliveryStatus || (isAr ? 'بانتظار المزامنة' : 'Waiting Sync')}
              </span>
            </div>

            {order.courier && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold">{isAr ? 'السائق:' : 'Courier:'}</span>
                  <span className="text-[12px] font-black text-slate-700">{order.courier.name}</span>
                </div>
                {order.courier.phone && (
                  <a href={`tel:${order.courier.phone}`} className="p-2 bg-white border border-slate-200 rounded-lg text-blue-600">
                    <MapPin size={14} />
                  </a>
                )}
              </div>
            )}

            {!order.isSynced && order.isSynced !== undefined && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-600 bg-orange-50 p-1.5 rounded-lg justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                {isAr ? 'لم يتم الإرسال للمندوب بعد' : 'Sync Pending'}
              </div>
            )}

            {order.trackingUrl && (
              <a 
                href={order.trackingUrl} 
                target="_blank" 
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-black transition-colors"
              >
                <ExternalLink size={13} />
                {isAr ? 'تتبع الموقع المباشر' : 'Track live location'}
              </a>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          {/* Cancel — ONLY for waiter/cashier */}
          {canCancel ? (
            <button
              type="button"
              onClick={() => updateOrderStatus(order.id, ORDER_STATUS.cancelled)}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors bg-transparent border-none"
            >
              <X size={13} strokeWidth={2.5} />
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          ) : <div />}

          <div className="flex items-center gap-2 shrink-0">
            {nextActions.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => handleModifyStatus(status)}
                className={`whitespace-nowrap cursor-pointer rounded-lg px-3.5 py-2 text-[11px] font-black shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                  status === ORDER_STATUS.ready ? 'bg-emerald-500 hover:bg-emerald-600 text-white' :
                  status === ORDER_STATUS.served ? 'bg-[#1D4E89] hover:bg-[#163d6b] text-white' :
                  'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {getActionLabel(status, language)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export default OrderCard;
