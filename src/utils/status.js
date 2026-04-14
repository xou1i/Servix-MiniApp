export const ORDER_STATUS = {
  draft: 'draft',
  sent_to_kitchen: 'sent_to_kitchen',
  preparing: 'preparing',
  ready: 'ready',
  served: 'served',
  billed: 'billed',
  paid: 'paid',
  cancelled: 'cancelled',
};

export const STATUS_META = {
  [ORDER_STATUS.draft]: {
    labelAr: 'مسودة',
    labelEn: 'Draft',
    label:   'مسودة',
    color:   'status-pending', // Reusing light grey
  },
  [ORDER_STATUS.sent_to_kitchen]: {
    labelAr: 'أُرسل للمطبخ',
    labelEn: 'Sent to Kitchen',
    label:   'أُرسل للمطبخ',
    color:   'status-pending',
  },
  [ORDER_STATUS.preparing]: {
    labelAr: 'قيد التحضير',
    labelEn: 'Preparing',
    label:   'قيد التحضير',
    color:   'status-preparing',
  },
  [ORDER_STATUS.ready]: {
    labelAr: 'جاهز للاستلام',
    labelEn: 'Ready',
    label:   'جاهز للاستلام',
    color:   'status-ready',
  },
  [ORDER_STATUS.served]: {
    labelAr: 'تم التقديم',
    labelEn: 'Served',
    label:   'تم التقديم',
    color:   'status-completed',
  },
  [ORDER_STATUS.billed]: {
    labelAr: 'في انتظار الدفع',
    labelEn: 'Billed',
    label:   'في انتظار الدفع',
    color:   'status-preparing', // usually orange or distinct for bills
  },
  [ORDER_STATUS.paid]: {
    labelAr: 'مدفوع (مكتمل)',
    labelEn: 'Paid',
    label:   'مدفوع (مكتمل)',
    color:   'status-completed', // green
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
