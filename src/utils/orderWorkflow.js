import { ORDER_STATUS } from './status';

export const STATUS_TRANSITIONS = {
  [ORDER_STATUS.preparing]: [ORDER_STATUS.ready, ORDER_STATUS.cancelled],
  [ORDER_STATUS.ready]: [ORDER_STATUS.served, ORDER_STATUS.cancelled],
  [ORDER_STATUS.served]: [],
  [ORDER_STATUS.billed]: [],
  [ORDER_STATUS.paid]: [],
  [ORDER_STATUS.cancelled]: [],
};

export function getNextStatusActions(currentStatus) {
  return STATUS_TRANSITIONS[currentStatus] ?? [];
}

export const STATUS_ACTION_LABELS = {
  ar: {
    [ORDER_STATUS.preparing]: 'قيد التحضير',
    [ORDER_STATUS.ready]: 'جاهز للتقديم',
    [ORDER_STATUS.served]: 'تم التقديم',
    [ORDER_STATUS.billed]: 'إصدار فاتورة',
    [ORDER_STATUS.paid]: 'تأكيد الدفع',
    [ORDER_STATUS.cancelled]: 'إلغاء',
  },
  en: {
    [ORDER_STATUS.preparing]: 'Preparing',
    [ORDER_STATUS.ready]: 'Mark Ready',
    [ORDER_STATUS.served]: 'Mark Served',
    [ORDER_STATUS.billed]: 'Generate Bill',
    [ORDER_STATUS.paid]: 'Confirm Payment',
    [ORDER_STATUS.cancelled]: 'Cancel',
  },
};

export function getActionLabel(status, lang = 'ar') {
  return STATUS_ACTION_LABELS[lang]?.[status] ?? status;
}
