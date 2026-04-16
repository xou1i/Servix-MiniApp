import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppStateContext } from './appStateContext';
import { STATUS_META, ORDER_STATUS } from '../utils/status';
import { generateId } from '../utils/id';
import { routeItems } from '../data/menu';
import { ordersService } from '../services/orders.service';
import { useSignalR } from '../hooks/useSignalR';
import { authService } from '../services/auth.service';

export function AppStateProvider({ children }) {
  // Start with mock data as fallback; API data overwrites on success
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [language, setLanguage] = useState('ar'); // 'ar' | 'en'

  // Get current role for SignalR subscriptions
  const storedUser = authService.getStoredUser();
  const currentRole = storedUser?.role?.toLowerCase() ?? '';

  const refetchOrders = useCallback(() => {
    ordersService.getAll()
      .then(apiOrders => {
        if (apiOrders) setOrders(apiOrders);
      })
      .catch(err => {
        console.warn('[AppState] Failed to fetch orders:', err.message);
      });
  }, []);

  // ── Fetch orders from API on mount ─────────────────────────────────────
  useEffect(() => {
    refetchOrders();
  }, [refetchOrders]);

  // ── Notification helper ────────────────────────────────────────────────
  const pushNotification = useCallback((partial) => {
    setNotifications((prev) => [
      { id: generateId('ntf'), read: false, createdAt: Date.now(), ...partial },
      ...prev,
    ]);
  }, []);

  // ── SignalR Real-Time Integration ──────────────────────────────────────
  useSignalR({
    role: currentRole,
    onNewOrder: useCallback((data) => {
      // data = { orderId, orderDetails, ... } — shape depends on backend
      if (data) {
        // Refresh orders from API to get full data
        ordersService.getAll()
          .then(apiOrders => {
            if (apiOrders && apiOrders.length > 0) {
              setOrders(apiOrders);
            }
          })
          .catch(() => {});

        pushNotification({
          type: 'new_order',
          title: language === 'en' ? 'New Order Received' : 'طلب جديد وصل',
          body: language === 'en'
            ? `New order ${data.orderId || ''} has been placed.`
            : `تم إنشاء طلب جديد ${data.orderId || ''}`,
          orderId: data.orderId,
        });
      }
    }, [language, pushNotification]),

    onStatusChanged: useCallback((data) => {
      // data = { orderId, status }
      if (data?.orderId && data?.status) {
        setOrders(prev => prev.map(o =>
          o.id === data.orderId ? { ...o, status: data.status } : o
        ));

        const meta = STATUS_META[data.status];
        const label = meta?.label ?? data.status;
        pushNotification({
          type: 'status_updated',
          title: language === 'en' ? 'Order Status Updated' : 'تم تحديث حالة الطلب',
          body: language === 'en'
            ? `Order ${data.orderId} is now: ${label}`
            : `الطلب ${data.orderId} أصبح: ${label}`,
          orderId: data.orderId,
        });
      }
    }, [language, pushNotification]),

    onNewItems: useCallback((data) => {
      // data = { orderId, items, department }
      if (data) {
        pushNotification({
          type: 'new_order',
          title: language === 'en' ? 'New Items to Prepare' : 'أصناف جديدة للتحضير',
          body: language === 'en'
            ? `New items for order ${data.orderId || ''}`
            : `أصناف جديدة للطلب ${data.orderId || ''}`,
          orderId: data.orderId,
        });
      }
    }, [language, pushNotification]),

    onMyOrderUpdate: useCallback((data) => {
      // data = { orderId, status }
      if (data?.orderId && data?.status) {
        setOrders(prev => prev.map(o =>
          o.id === data.orderId ? { ...o, status: data.status } : o
        ));
      }
    }, []),
  });

  // ── Order actions ─────────────────────────────────────────────────────────
  const updateOrderStatus = useCallback((orderId, nextStatus) => {
    let prevStatus;
    // Optimistic local update
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        prevStatus = o.status;
        if (o.status === nextStatus) return o;
        return { ...o, status: nextStatus };
      }),
    );

    // Sync with API (fire-and-forget with error logging)
    ordersService.updateStatus(orderId, nextStatus).catch(err => {
      console.error('[AppState] Failed to update order status via API:', err.message);
      // Optionally rollback: setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: prevStatus } : o));
    });

    setNotifications((prev) => {
      if (prevStatus === undefined || prevStatus === nextStatus) return prev;
      const meta = STATUS_META[nextStatus];
      const label = meta?.label ?? nextStatus;
      return [
        {
          id: generateId('ntf'),
          type: 'status_updated',
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

  const addOrder = useCallback(() => {
     // Deprecated: use refs to refetchOrders after submission externally
     refetchOrders();
  }, [refetchOrders]);

  // ── Notification actions ──────────────────────────────────────────────────
  const markNotificationRead = useCallback(
    (id) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))),
    [],
  );

  const markAllNotificationsRead = useCallback(
    () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
    [],
  );

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
      refetchOrders,
      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      pushNotification,
      language,
      switchLanguage,
    }),
    [orders, updateOrderStatus, updateDepartmentStatus, addOrder, refetchOrders, notifications, markNotificationRead, markAllNotificationsRead, pushNotification, language, switchLanguage],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
