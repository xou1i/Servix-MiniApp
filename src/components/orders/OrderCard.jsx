import { Clock3, UtensilsCrossed, NotebookPen, X, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../StatusBadge';
import { useAppState } from '../../hooks/useAppState';
import { getNextStatusActions, getActionLabel } from '../../utils/orderWorkflow';
import { DEPARTMENT } from '../../constants/roles';
import { ORDER_STATUS } from '../../utils/status';

const ACTION_STYLE = {
  preparing: 'bg-[var(--color-preparing)] text-slate-900',
  ready:     'bg-[var(--color-ready)] text-white',
  served:    'bg-[var(--color-primary)] text-white',
  completed: 'bg-[var(--color-teal)] text-white',
  cancelled: 'bg-slate-300 text-slate-700',
};

/** Only Waiter and Cashier can cancel orders */
const CANCEL_ROLES = ['waiter', 'cashier'];

function OrderCard({ order, roleKey }) {
  const { updateOrderStatus, updateDepartmentStatus, language } = useAppState();
  const isAr = language !== 'en';

  // Determine which items to show based on role
  let displayItems = order.items;
  if (roleKey === 'chef')    displayItems = order.kitchenItems;
  if (roleKey === 'barista') displayItems = order.baristaItems;

  const canModifyStatus = ['chef', 'barista'].includes(roleKey);
  
  const canCancel = CANCEL_ROLES.includes(roleKey)
    && order.status !== ORDER_STATUS.paid
    && order.status !== ORDER_STATUS.cancelled;
    
  // Filter actions based on role constraints securely 
  let nextActions = canModifyStatus ? getNextStatusActions(order.status) : [];
  if (['chef', 'barista'].includes(roleKey)) {
     const myDepartmentStatus = roleKey === 'chef' ? order.kitchenStatus : order.baristaStatus;
     nextActions = getNextStatusActions(myDepartmentStatus || order.status);
  }

  const handleModifyStatus = (nextStatus) => {
     if (roleKey === 'chef') {
        updateDepartmentStatus(order.id, 'kitchen', nextStatus);
     } else if (roleKey === 'barista') {
        updateDepartmentStatus(order.id, 'barista', nextStatus);
     } else {
        updateOrderStatus(order.id, nextStatus);
     }
  };
  const minutesLabel = isAr
    ? `منذ ${order.minutesAgo} ${order.minutesAgo === 1 ? 'دقيقة' : 'دقيقة'}`
    : `${order.minutesAgo}m ago`;

  return (
    <article
      className="glass-card h-full animate-slide-up flex flex-col rounded-[1.2rem] shadow-[0_4px_16px_rgba(21,28,34,0.06)] border border-[var(--border-light)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(21,28,34,0.1)] overflow-hidden bg-white"
      style={{ '--delay': '0ms' }}
    >
      {/* 1. Top Header Bar (Metadata Row) */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--surface-high)] bg-white/40">
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mt-[1px]">
            {order.id}
          </span>
          {order.type && (
             <span className="px-2 py-[3px] rounded-[0.4rem] text-[9.5px] whitespace-nowrap font-extrabold shrink-0 border"
                   style={{
                     backgroundColor: order.type === 'dine-in' ? '#1D4E891a' : 
                                      order.type === 'takeaway' ? '#FCA3111a' : 
                                      order.type === 'delivery' ? '#7209B71a' : '#f8fafc',
                     color: order.type === 'dine-in' ? '#1D4E89' : 
                            order.type === 'takeaway' ? '#FCA311' : 
                            order.type === 'delivery' ? '#7209B7' : '#64748b',
                     borderColor: order.type === 'dine-in' ? '#1D4E8933' : 
                                  order.type === 'takeaway' ? '#FCA31133' : 
                                  order.type === 'delivery' ? '#7209B733' : '#e2e8f0'
                   }}>
                {order.type === 'dine-in' ? (isAr ? 'صالة' : 'Dine-In') :
                 order.type === 'takeaway' ? (isAr ? 'سفري' : 'Takeaway') :
                 order.type === 'delivery' ? (isAr ? 'توصيل' : 'Delivery') : ''}
             </span>
          )}
        </div>
        <div className="shrink-0 scale-95 origin-left">
           <StatusBadge status={order.status} lang={language} />
        </div>
      </div>

      {/* 2. Main Content Body */}
      <div className="flex-1 flex flex-col p-4 gap-2.5 bg-white">
        
        {/* Table Number Indicator (Only for Dine-In) */}
        {order.type === 'dine-in' && (
           <div className="flex justify-start mb-0.5">
             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-black shadow-sm"
                   style={{ backgroundColor: '#ADB5BD1a', color: '#1D4E89', border: '1px solid #ADB5BD33' }}>
               {isAr ? `طاولة ${order.table}` : `Table ${order.table}`}
             </span>
           </div>
        )}

        {/* Items list */}
        <div className="flex-1 flex flex-col gap-1.5">
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
                <div key={i} className={`flex items-start gap-2.5 transition-colors ${isItemReady ? 'text-green-700' : 'text-[var(--text-primary)]'}`}>
                  {isItemReady ? (
                    <CheckCircle2 size={15} className="text-green-600 shrink-0 mt-[1px]" />
                  ) : (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--text-muted)]/40 mt-[7px]" />
                  )}
                  <span className={`font-bold text-[13px] leading-snug whitespace-normal ${isItemReady ? 'line-through opacity-50 font-semibold' : ''}`}>{item}</span>
                </div>
              );
            })
          ) : (
            <p className="text-[12px] text-[var(--text-muted)] italic font-semibold">
              {isAr ? 'لا توجد أصناف لهذا القسم' : 'No items for this section'}
            </p>
          )}

          {/* Notes (Fixed position visually at bottom of list space) */}
          {order.notes && (
            <div className="mt-auto pt-3">
              <div className="rounded-[0.85rem] py-2.5 px-3 border"
                   style={{ backgroundColor: '#ADB5BD0a', borderColor: '#ADB5BD33' }}>
                <p className="text-[11px] font-bold leading-relaxed flex gap-1.5 items-start" style={{ color: '#6C757D' }}>
                  <NotebookPen size={13} className="shrink-0 mt-[1px]" />
                  <span className="whitespace-normal leading-snug">"{order.notes}"</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Footer Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--surface-high)] bg-white">
        {/* Left: Time Indicator */}
        <span className="flex items-center gap-1.5 text-[11px] font-black text-[var(--text-muted)] shrink-0 opacity-80">
          <Clock3 size={13} strokeWidth={2.5} />
          {minutesLabel}
        </span>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 max-w-full">
           {nextActions.length > 0 && nextActions
              .filter((s) => s !== 'cancelled') 
              .map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleModifyStatus(status)}
                  className={`whitespace-nowrap cursor-pointer rounded-lg px-3.5 py-1.5 text-[11px] font-black shadow-sm transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-95 border border-transparent ${ACTION_STYLE[status] ?? 'bg-[#EDF2F7] text-[var(--color-primary)]'}`}
                >
                  {getActionLabel(status, language)}
                </button>
              ))
           }

           {canCancel && (
             <button
               type="button"
               onClick={() => updateOrderStatus(order.id, ORDER_STATUS.cancelled)}
               className="cancel-order-btn whitespace-nowrap cursor-pointer flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-black transition-all duration-200 ease-out active:scale-95"
               style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-light)' }}
               onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.borderColor = '#FECACA'; }}
               onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
             >
               <X size={12} strokeWidth={3} className="opacity-80" />
               {isAr ? 'إلغاء' : 'Cancel'}
             </button>
           )}
        </div>
      </div>
    </article>
  );
}

export default OrderCard;
