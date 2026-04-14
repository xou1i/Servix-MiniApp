import { useCallback, useMemo, useState } from 'react';
import { mockOrders } from '../data/mockOrders';
import { NOTIFICATION_TYPES, seedNotifications } from '../data/mockNotifications';
import { AppStateContext } from './appStateContext';
import { STATUS_META, ORDER_STATUS } from '../utils/status';
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

  const updateDepartmentStatus = useCallback((orderId, department, nextStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        
        const newKitchenStatus = department === 'kitchen' ? nextStatus : o.kitchenStatus;
        const newBaristaStatus = department === 'barista' ? nextStatus : o.baristaStatus;
        
        const resolvedStatuses = [ORDER_STATUS.ready, ORDER_STATUS.served, ORDER_STATUS.billed, ORDER_STATUS.paid, ORDER_STATUS.cancelled];
        const kitchenResolved = !o.kitchenItems?.length || resolvedStatuses.includes(newKitchenStatus);
        const baristaResolved = !o.baristaItems?.length || resolvedStatuses.includes(newBaristaStatus);
        
        // If both departments are resolved to at least 'ready', sync parent dynamically
        let newOrderStatus = o.status;
        if (kitchenResolved && baristaResolved) {
           newOrderStatus = (newKitchenStatus === ORDER_STATUS.served || newBaristaStatus === ORDER_STATUS.served) ? ORDER_STATUS.served : ORDER_STATUS.ready;
        }
        
        return { 
          ...o, 
          kitchenStatus: newKitchenStatus, 
          baristaStatus: newBaristaStatus, 
          status: newOrderStatus 
        };
      })
    );
  }, []);

  const addOrder = useCallback(
    ({ cartPayload, type, tableId, delivery, orderNote }) => {
      if (!cartPayload || cartPayload.length === 0) return;
      
      const kitchenItems = [];
      const baristaItems = [];
      const flatItems = [];

      cartPayload.forEach(item => {
        // Construct visual title line with qty 
        const qtyString = item.qty > 1 ? `${item.qty}x ` : '';
        const title = `${qtyString}${item.name}`;
        
        flatItems.push(title);

        // Departmental Splitting Logic
        // In real backend integration, target_department will be provided 
        // Currently mapping our mock UI categories:
        if (item.product?.category === 'cat_drinks' || item.product?.category === 'drink') {
           baristaItems.push(title);
        } else {
           kitchenItems.push(title);
        }
      });

      const id = `ORD-${Math.floor(2049 + Math.random() * 900)}`;
      const tableDisplay = type === 'takeaway' ? 'سفري' : type === 'delivery' ? 'توصيل' : tableId || 'صالة';

      const newOrder = {
        id,
        table: tableDisplay,
        type,
        delivery,
        kitchenItems,
        baristaItems,
        items: flatItems,
        minutesAgo: 0,
        status: ORDER_STATUS.preparing,
        kitchenStatus: kitchenItems.length > 0 ? ORDER_STATUS.preparing : null,
        baristaStatus: baristaItems.length > 0 ? ORDER_STATUS.preparing : null,
        notes: [orderNote, ...cartPayload.map(c => c.notes).filter(Boolean)].filter(Boolean).join(' | ') || '',
      };
      setOrders((prev) => [newOrder, ...prev]);
      setNotifications((prev) => [
        {
          id: generateId('ntf'),
          type: NOTIFICATION_TYPES.newOrder,
          title: language === 'en' ? 'New Order Received' : 'طلب جديد وصل',
          body:
            language === 'en'
              ? `Order ${id} for ${tableDisplay} — ${flatItems.slice(0, 3).join(', ')}${flatItems.length > 3 ? '...' : ''}`
              : `الطلب ${id} لـ ${tableDisplay} — ${flatItems.slice(0, 3).join('، ')}${flatItems.length > 3 ? '...' : ''}`,
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
      updateDepartmentStatus,
      addOrder,
      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      pushNotification,
      language,
      switchLanguage,
    }),
    [orders, updateOrderStatus, updateDepartmentStatus, addOrder, notifications, markNotificationRead, markAllNotificationsRead, pushNotification, language, switchLanguage],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
