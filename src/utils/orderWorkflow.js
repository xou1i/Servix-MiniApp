import { ORDER_STATUS } from './status';

export const STATUS_TRANSITIONS = {
  [ORDER_STATUS.pending]:   [ORDER_STATUS.preparing, ORDER_STATUS.cancelled],
  [ORDER_STATUS.preparing]: [ORDER_STATUS.ready,     ORDER_STATUS.cancelled],
  [ORDER_STATUS.ready]:     [ORDER_STATUS.completed],
  [ORDER_STATUS.completed]:  [],
  [ORDER_STATUS.cancelled]: [],
};

export function getNextStatusActions(currentStatus) {
  return STATUS_TRANSITIONS[currentStatus] ?? [];
}

export const STATUS_ACTION_LABELS = {
  ar: {
    [ORDER_STATUS.preparing]: 'بدء التحضير',
    [ORDER_STATUS.ready]:     'جاهز للتقديم',
    [ORDER_STATUS.completed]: 'مكتمل',
    [ORDER_STATUS.cancelled]: 'إلغاء',
  },
  en: {
    [ORDER_STATUS.preparing]: 'Start Cooking',
    [ORDER_STATUS.ready]:     'Mark Ready',
    [ORDER_STATUS.completed]: 'Mark Completed',
    [ORDER_STATUS.cancelled]: 'Cancel',
  },
};

export function getActionLabel(status, lang = 'ar') {
  return STATUS_ACTION_LABELS[lang]?.[status] ?? status;
}
