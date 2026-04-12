export const ORDER_STATUS = {
  pending:   'pending',
  preparing: 'preparing',
  ready:     'ready',
  completed: 'completed',
  cancelled: 'cancelled',
};

export const STATUS_META = {
  [ORDER_STATUS.pending]: {
    labelAr: 'قيد الانتظار',
    labelEn: 'Pending',
    label:   'قيد الانتظار',
    color:   'status-pending',
  },
  [ORDER_STATUS.preparing]: {
    labelAr: 'قيد التحضير',
    labelEn: 'Preparing',
    label:   'قيد التحضير',
    color:   'status-preparing',
  },
  [ORDER_STATUS.ready]: {
    labelAr: 'جاهز',
    labelEn: 'Ready',
    label:   'جاهز',
    color:   'status-ready',
  },
  [ORDER_STATUS.completed]: {
    labelAr: 'مكتمل',
    labelEn: 'Completed',
    label:   'مكتمل',
    color:   'status-completed',
  },
  [ORDER_STATUS.cancelled]: {
    labelAr: 'ملغي',
    labelEn: 'Cancelled',
    label:   'ملغي',
    color:   'status-cancelled',
  },
};

export function getStatusLabel(status, lang = 'ar') {
  const meta = STATUS_META[status];
  if (!meta) return status;
  return lang === 'en' ? meta.labelEn : meta.labelAr;
}
