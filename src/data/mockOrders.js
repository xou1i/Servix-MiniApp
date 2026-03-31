import { ORDER_STATUS } from '../utils/status';

function order({ id, table, kitchenItems = [], baristaItems = [], minutesAgo, status, notes = '' }) {
  return { id, table, kitchenItems, baristaItems, items: [...kitchenItems, ...baristaItems], minutesAgo, status, notes };
}

export const mockOrders = [
  order({ id: 'ORD-2041', table: 'T1',  kitchenItems: ['برجر', 'بطاطس'],           baristaItems: ['عصير طازج'],      minutesAgo: 3,  status: ORDER_STATUS.pending,   notes: 'بدون بصل' }),
  order({ id: 'ORD-2042', table: 'T5',  kitchenItems: ['بيتزا', 'سلطة'],           baristaItems: [],                  minutesAgo: 9,  status: ORDER_STATUS.preparing, notes: 'حار قليل' }),
  order({ id: 'ORD-2043', table: 'T12', kitchenItems: ['باستا'],                   baristaItems: ['لاتيه'],           minutesAgo: 14, status: ORDER_STATUS.ready,     notes: 'إضافة جبن' }),
  order({ id: 'ORD-2044', table: 'T8',  kitchenItems: ['دجاج مشوي'],               baristaItems: ['كابتشينو'],        minutesAgo: 7,  status: ORDER_STATUS.preparing, notes: 'بدون صوص' }),
  order({ id: 'ORD-2045', table: 'T3',  kitchenItems: ['سلطة', 'ستيك'],            baristaItems: ['موكا', 'شاي'],    minutesAgo: 22, status: ORDER_STATUS.pending,   notes: 'بدون ملح' }),
  order({ id: 'ORD-2046', table: 'T10', kitchenItems: ['بيتزا'],                   baristaItems: ['أمريكانو'],        minutesAgo: 30, status: ORDER_STATUS.ready,     notes: 'طلب سريع' }),
  order({ id: 'ORD-2047', table: 'T2',  kitchenItems: [],                          baristaItems: ['إسبريسو', 'شاي'], minutesAgo: 4,  status: ORDER_STATUS.preparing, notes: 'سكر خفيف' }),
  order({ id: 'ORD-2048', table: 'T7',  kitchenItems: ['ستيك', 'بطاطس'],           baristaItems: ['مشروب غازي'],     minutesAgo: 11, status: ORDER_STATUS.pending,   notes: '' }),
];
