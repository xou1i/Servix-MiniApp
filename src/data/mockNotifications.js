export const NOTIFICATION_TYPES = {
  newOrder: 'new_order',
  statusUpdated: 'status_updated',
  delayed: 'delayed',
  itemUnavailable: 'item_unavailable',
};

/** بيانات أولية — يُكمّلها السياق عند أحداث الطلبات */
export const seedNotifications = [
  {
    id: 'ntf-1',
    type: NOTIFICATION_TYPES.newOrder,
    title: 'طلب جديد وصل',
    body: 'الطلب ORD-2041 للطاولة T1 — برجر لحم وبطاطس',
    read: false,
    createdAt: Date.now() - 2 * 60_000,
    orderId: 'ORD-2041',
  },
  {
    id: 'ntf-2',
    type: NOTIFICATION_TYPES.statusUpdated,
    title: 'تم تحديث حالة الطلب',
    body: 'طلب ORD-2042 انتقل إلى قيد التحضير',
    read: false,
    createdAt: Date.now() - 8 * 60_000,
    orderId: 'ORD-2042',
  },
  {
    id: 'ntf-3',
    type: NOTIFICATION_TYPES.delayed,
    title: 'طلب متأخر',
    body: 'طلب ORD-2045 يتجاوز الوقت المتوقع للتحضير',
    read: true,
    createdAt: Date.now() - 25 * 60_000,
    orderId: 'ORD-2045',
  },
  {
    id: 'ntf-4',
    type: NOTIFICATION_TYPES.itemUnavailable,
    title: 'عنصر غير متوفر',
    body: 'الصنف «قهوة لاتيه» غير متاح حالياً للطلب ORD-2043',
    read: false,
    createdAt: Date.now() - 40 * 60_000,
    orderId: 'ORD-2043',
  },
];
