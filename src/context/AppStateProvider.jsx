// AppStateProvider.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppStateContext } from './appStateContext';
import { STATUS_META, ORDER_STATUS } from '../utils/status';
import { generateId } from '../utils/id';
import { routeItems } from '../data/menu';
import { ordersService } from '../services/orders.service';
import { useSignalR } from '../hooks/useSignalR';
import { authService } from '../services/auth.service';

// ── Helper: normalize a single backend order into frontend shape ──────────
function normalizeOrder(o) {
  const rawItems = Array.isArray(o.items) ? o.items : [];

  // Format for OrderCard (expects array of strings)
  const itemStrings = rawItems.map(ri =>
    `${ri.quantity > 1 ? ri.quantity + 'x ' : ''}${ri.menuItemName || ri.name || 'صنف'}`
  );

  // Kitchen handles all food; Barista handles drinks
  const baristaDepartmentNames = ['البارستا', 'المشروبات والعصائر'];

  const kitchenStrs =
    Array.isArray(o.kitchenItems) && typeof o.kitchenItems[0] === 'string'
      ? o.kitchenItems
      : rawItems
          .filter(ri => !baristaDepartmentNames.includes(ri.departmentName))
          .map(ri => `${ri.quantity > 1 ? ri.quantity + 'x ' : ''}${ri.menuItemName || ri.name || 'صنف'}`);

  const baristaStrs =
    Array.isArray(o.baristaItems) && typeof o.baristaItems[0] === 'string'
      ? o.baristaItems
      : rawItems
          .filter(ri => baristaDepartmentNames.includes(ri.departmentName))
          .map(ri => `${ri.quantity > 1 ? ri.quantity + 'x ' : ''}${ri.menuItemName || ri.name || 'صنف'}`);

  // Normalize Backend Status -> Frontend ORDER_STATUS
  // Backend sends: Pending, Confirmed, Preparing, Ready, Served, Completed, Cancelled
  let normalizedStatus = (o.status || '').toLowerCase();
  if (normalizedStatus === 'pending' || normalizedStatus === 'confirmed') normalizedStatus = 'preparing';
  if (normalizedStatus === 'completed') normalizedStatus = 'paid';
  // Already matching: preparing, ready, served, cancelled

  // Normalize order type: Backend sends 'DineIn'/'TakeAway'/'Delivery'
  const rawType = (o.orderType || o.type || '').toLowerCase().replace(/[-_\s]/g, '');
  let normalizedType = 'takeaway';
  if (rawType === 'dinein') normalizedType = 'dine-in';
  else if (rawType === 'takeaway') normalizedType = 'takeaway';
  else if (rawType === 'delivery') normalizedType = 'delivery';

  // Calculate minutesAgo from createdAt
  let minutesAgo = 0;
  if (o.createdAt) {
    const created = new Date(o.createdAt);
    minutesAgo = Math.max(0, Math.round((Date.now() - created.getTime()) / 60000));
  }

  return {
    ...o,
    status: normalizedStatus,
    type: normalizedType,
    // Table code: backend may send tableNumber, code, or nothing
    table: o.tableNumber || o.code || o.tableCode || null,
    tableNumber: o.tableNumber || o.code || o.tableCode || null,
    minutesAgo,
    // Notes: backend may use note, notes, specialNotes, or customerNotes
    notes: o.note || o.notes || o.specialNotes || o.customerNotes || '',
    _rawItems: rawItems,
    items: itemStrings.length > 0 ? itemStrings : (o.items || []),
    kitchenItems: kitchenStrs.length > 0 ? kitchenStrs : (o.kitchenItems || []),
    baristaItems: baristaStrs.length > 0 ? baristaStrs : (o.baristaItems || []),
  };
}

export function AppStateProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [language, setLanguage] = useState('ar'); // 'ar' | 'en'

  // Get current role for SignalR subscriptions
  const storedUser = authService.getStoredUser();
  const currentRole = storedUser?.role?.toLowerCase() ?? '';

  const refetchOrders = useCallback(() => {
    return ordersService.getAll()
      .then(apiOrders => {
        if (Array.isArray(apiOrders)) {
          const processedOrders = apiOrders.map(normalizeOrder);
          setOrders(processedOrders);
        }
      })
      .catch(err => {
        console.warn('[AppState] Failed to fetch orders:', err.message);
      });
  }, []);

  // Helper: add a single new order to state (avoids full refetch)
  const addNewOrderToState = useCallback((rawOrder) => {
    if (!rawOrder || !rawOrder.id) return;
    const processed = normalizeOrder(rawOrder);
    setOrders(prev => {
      // Avoid duplicates
      if (prev.some(o => o.id === processed.id)) return prev;
      return [processed, ...prev];
    });
  }, []);

  // ── Fetch orders from API on mount ─────────────────────────────────────
  useEffect(() => {
    refetchOrders();
  }, [refetchOrders]);

  // ── Update minutesAgo every 60s ───────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prev => prev.map(o => {
        if (!o.createdAt) return o;
        const created = new Date(o.createdAt);
        return { ...o, minutesAgo: Math.max(0, Math.round((Date.now() - created.getTime()) / 60000)) };
      }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

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
      if (data) {
        // Add the single order directly instead of refetching all
        if (data.orderDetails) {
          addNewOrderToState(data.orderDetails);
        } else {
          refetchOrders();
        }

        pushNotification({
          type: 'new_order',
          title: language === 'en' ? 'New Order Received' : 'طلب جديد وصل',
          body: language === 'en'
            ? `New order ${data.orderId || ''} has been placed.`
            : `تم إنشاء طلب جديد ${data.orderId || ''}`,
          orderId: data.orderId,
        });
      }
    }, [language, pushNotification, refetchOrders, addNewOrderToState]),

    onStatusChanged: useCallback((data) => {
      if (data?.orderId && data?.status) {
        let normalizedStatus = (data.status || '').toLowerCase();
        if (normalizedStatus === 'pending' || normalizedStatus === 'confirmed') normalizedStatus = 'preparing';
        if (normalizedStatus === 'completed') normalizedStatus = 'paid';

        setOrders(prev => prev.map(o =>
          o.id === data.orderId ? { ...o, status: normalizedStatus } : o
        ));

        const meta = STATUS_META[normalizedStatus];
        const label = meta?.label ?? normalizedStatus;
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
      if (data?.orderId && data?.status) {
        let normalizedStatus = (data.status || '').toLowerCase();
        if (normalizedStatus === 'pending' || normalizedStatus === 'confirmed') normalizedStatus = 'preparing';
        if (normalizedStatus === 'completed') normalizedStatus = 'paid';
        setOrders(prev => prev.map(o =>
          o.id === data.orderId ? { ...o, status: normalizedStatus } : o
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

    // Sync with API
    ordersService.updateStatus(orderId, nextStatus).catch(err => {
      console.error('[AppState] Failed to update order status via API:', err.message);
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

  const addOrder = useCallback((rawOrder) => {
    if (rawOrder && rawOrder.id) {
      addNewOrderToState(rawOrder);
    } else {
      refetchOrders();
    }
  }, [refetchOrders, addNewOrderToState]);

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
      addNewOrderToState,
      refetchOrders,
      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      pushNotification,
      language,
      switchLanguage,
    }),
    [orders, updateOrderStatus, updateDepartmentStatus, addOrder, addNewOrderToState, refetchOrders, notifications, markNotificationRead, markAllNotificationsRead, pushNotification, language, switchLanguage],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
