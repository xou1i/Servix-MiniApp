import { useCallback, useMemo, useState } from 'react';
import { mockOrders } from '../data/mockOrders';
import { NOTIFICATION_TYPES, seedNotifications } from '../data/mockNotifications';
import { AppStateContext } from './appStateContext';
import { STATUS_META } from '../utils/status';
import { generateId } from '../utils/id';
import { routeItems } from '../data/menu';

export function AppStateProvider({ children }) {
  const [orders, setOrders] = useState(mockOrders);
  const [notifications, setNotifications] = useState(seedNotifications);
  const [language, setLanguage] = useState('ar'); // 'ar' | 'en'

  // ── Order actions ─────────────────────────────────────────────────────────
  const updateOrderStatus = useCallback((orderId, nextStatus) => {
    let prevStatus;
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        prevStatus = o.status;
        if (o.status === nextStatus) return o;
        return { ...o, status: nextStatus };
      }),
    );

    setNotifications((prev) => {
      if (prevStatus === undefined || prevStatus === nextStatus) return prev;
      const meta = STATUS_META[nextStatus];
      const label = meta?.label ?? nextStatus;
      return [
        {
          id: generateId('ntf'),
          type: NOTIFICATION_TYPES.statusUpdated,
          title: language === 'en' ? 'Order Status Updated' : 'تم تحديث حالة الطلب',
          body:
            language === 'en'
              ? `Order ${orderId} is now: ${label}`
              : `الطلب ${orderId} أصبح: ${label}`,
          read: false,
          createdAt: Date.now(),
          orderId,
        },
        ...prev,
      ];
    });
  }, [language]);

  const addOrder = useCallback(
    ({ selectedIds, table, notes }) => {
      const { kitchenItems, baristaItems } = routeItems(selectedIds, language);
      const items = [...kitchenItems, ...baristaItems];
      if (items.length === 0) return;
      const id = `ORD-${Math.floor(2049 + Math.random() * 900)}`;
      const newOrder = {
        id,
        table: table || 'T?',
        kitchenItems,
        baristaItems,
        items,
        minutesAgo: 0,
        status: 'pending',
        notes: notes || '',
      };
      setOrders((prev) => [newOrder, ...prev]);
      setNotifications((prev) => [
        {
          id: generateId('ntf'),
          type: NOTIFICATION_TYPES.newOrder,
          title: language === 'en' ? 'New Order Received' : 'طلب جديد وصل',
          body:
            language === 'en'
              ? `Order ${id} for table ${table} — ${items.slice(0, 3).join(', ')}${items.length > 3 ? '...' : ''}`
              : `الطلب ${id} للطاولة ${table} — ${items.slice(0, 3).join('، ')}${items.length > 3 ? '...' : ''}`,
          read: false,
          createdAt: Date.now(),
          orderId: id,
        },
        ...prev,
      ]);
    },
    [language],
  );

  // ── Notification actions ──────────────────────────────────────────────────
  const markNotificationRead = useCallback(
    (id) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))),
    [],
  );

  const markAllNotificationsRead = useCallback(
    () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
    [],
  );

  const pushNotification = useCallback((partial) => {
    setNotifications((prev) => [
      { id: generateId('ntf'), read: false, createdAt: Date.now(), ...partial },
      ...prev,
    ]);
  }, []);

  // ── Language ──────────────────────────────────────────────────────────────
  const switchLanguage = useCallback((lang) => {
    setLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, []);

  const value = useMemo(
    () => ({
      orders,
      setOrders,
      updateOrderStatus,
      addOrder,
      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      pushNotification,
      language,
      switchLanguage,
    }),
    [orders, updateOrderStatus, addOrder, notifications, markNotificationRead, markAllNotificationsRead, pushNotification, language, switchLanguage],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
