// AppStateProvider.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppStateContext } from './appStateContext';
import { STATUS_META, ORDER_STATUS } from '../utils/status';
import { generateId } from '../utils/id';
import { routeItems } from '../data/menu';
import { ordersService } from '../services/orders.service';
import { useSignalR } from '../hooks/useSignalR';
import { authService } from '../services/auth.service';

// ── Helper: map any department name (Arabic or English) to canonical key ───
// Backend may send: "Kitchen", "Barista", "المطبخ", "البارستا", "المشروبات والعصائر", etc.
const KITCHEN_NAMES = ['kitchen', 'مطبخ', 'المطبخ', 'المطابخ', 'رئيسي', 'الرئيسي', 'ساخن', 'الساخن', 'وجبات', 'اكل', 'طعام'];
const BARISTA_NAMES = ['barista', 'بارستا', 'باريستا', 'البارستا', 'المشروبات والعصائر', 'المشروبات', 'مشروبات', 'عصائر', 'بارد', 'البارد', 'قهوة'];

function resolveDeptKey(departmentName) {
  if (!departmentName) return null;
  const d = departmentName.trim().toLowerCase();
  
  const isKitchen = KITCHEN_NAMES.some(k => d.includes(k));
  const isBarista = BARISTA_NAMES.some(k => d.includes(k));
  
  if (isKitchen) return 'kitchen';
  if (isBarista) return 'barista';
  
  console.warn(`[resolveDeptKey] Unknown department: "${departmentName}"`);
  return null; 
}

// ── Helper: normalize a single backend order into frontend shape ──────────
function normalizeOrder(o) {
  const rawItems = Array.isArray(o.items) ? o.items : [];

  // Enrich each raw item with a canonical _deptKey for consistent filtering
  const enrichedItems = rawItems.map(ri => ({
    ...ri,
    _deptKey: resolveDeptKey(ri.departmentName),
  }));

  // Format for OrderCard (expects array of strings)
  const itemStrings = enrichedItems.map(ri =>
    `${ri.quantity > 1 ? ri.quantity + 'x ' : ''}${ri.menuItemName || ri.name || 'صنف'}`
  );

  // ── Department-based item splitting ────────────────────────────────────
  // Uses the resolved _deptKey for reliable matching
  const kitchenStrs = enrichedItems
    .filter(ri => ri._deptKey === 'kitchen')
    .map(ri => `${ri.quantity > 1 ? ri.quantity + 'x ' : ''}${ri.menuItemName || ri.name || 'صنف'}`);

  const baristaStrs = enrichedItems
    .filter(ri => ri._deptKey === 'barista')
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
    _rawItems: enrichedItems,
    items: itemStrings.length > 0 ? itemStrings : (o.items || []),
    kitchenItems: kitchenStrs.length > 0 ? kitchenStrs : (o.kitchenItems || []),
    baristaItems: baristaStrs.length > 0 ? baristaStrs : (o.baristaItems || []),
    
    // External Source Detection
    _isTeam6: (o.note || o.notes || o.specialNotes || '').includes('Team6'),
    _sourceLabel: (o.note || o.notes || o.specialNotes || '').includes('Team6') ? 'Team 6' : (o.partnerSource || o.externalPublicId ? (o.partnerSource || 'External') : null),
    
    // Delivery Sync & Tracking fields
    externalDeliveryStatus: o.externalDeliveryStatus,
    trackingUrl: o.trackingUrl,
    isSynced: o.isSyncedToExternalProvider,
    courier: o.courierName ? { name: o.courierName, phone: o.courierPhoneNumber } : null,
    externalId: o.externalPublicId || o.externalOrderId,
    
    // Customer Info
    customerName: o.customerName || (o.delivery ? o.delivery.name : null),
    deliveryAddress: o.deliveryAddress || (o.delivery ? o.delivery.address : null),
    customerPhoneNumber: o.customerPhoneNumber || (o.delivery ? o.delivery.phone : null)
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
    const token = authService.getToken();
    if (!token) return Promise.resolve(); // Don't fetch if not logged in

    return ordersService.getAll()
      .then(apiOrders => {
        if (Array.isArray(apiOrders)) {
          const processedOrders = apiOrders.map(normalizeOrder);
          setOrders(processedOrders);
        }
      })
      .catch(err => {
        if (err.response?.status !== 401) { // Hide 401s during initial load
          console.warn('[AppState] Failed to fetch orders:', err.message);
        }
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
          o.id === data.orderId 
            ? { 
                ...o, 
                ...normalizeOrder(data), // Use full normalized data if available
                status: normalizedStatus 
              } 
            : o
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
          o.id === data.orderId 
            ? { 
                ...o, 
                ...normalizeOrder(data), // Ensure courier/tracking Info is merged
                status: normalizedStatus 
              } 
            : o
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
    const apiStatus = nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1);
    ordersService.updateStatus(orderId, apiStatus).catch(err => {
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
    console.log(`[AppState] Updating ${department} to ${nextStatus} for order ${orderId}`);
    let finalAggregateStatus = null;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        
        const newKitchenStatus = department === 'kitchen' ? nextStatus : (o.kitchenStatus || o.status);
        const newBaristaStatus = department === 'barista' ? nextStatus : (o.baristaStatus || o.status);
        
        const resolvedStatuses = [ORDER_STATUS.ready, ORDER_STATUS.served, ORDER_STATUS.billed, ORDER_STATUS.paid, ORDER_STATUS.cancelled];
        const rawItems = o._rawItems || [];
        const hasKitchenItems = rawItems.some(ri => ri._deptKey === 'kitchen');
        const hasBaristaItems = rawItems.some(ri => ri._deptKey === 'barista');
        
        console.log(`[AppState] Order ${orderId} hasKitchen: ${hasKitchenItems}, hasBarista: ${hasBaristaItems}`);

        const kitchenResolved = !hasKitchenItems || resolvedStatuses.includes(newKitchenStatus);
        const baristaResolved = !hasBaristaItems || resolvedStatuses.includes(newBaristaStatus);
        
        let newOrderStatus = o.status;
        
        if (kitchenResolved && baristaResolved) {
          if (newKitchenStatus === ORDER_STATUS.served || newBaristaStatus === ORDER_STATUS.served) {
            newOrderStatus = ORDER_STATUS.served;
          } else {
            newOrderStatus = ORDER_STATUS.ready;
          }
        } 
        else if (newKitchenStatus === ORDER_STATUS.preparing || newBaristaStatus === ORDER_STATUS.preparing || o.status === ORDER_STATUS.preparing) {
          newOrderStatus = ORDER_STATUS.preparing;
        }

        finalAggregateStatus = newOrderStatus;
        console.log(`[AppState] Computed global status: ${newOrderStatus}`);

        return { 
          ...o, 
          kitchenStatus: newKitchenStatus, 
          baristaStatus: newBaristaStatus, 
          status: newOrderStatus 
        };
      })
    );

    if (finalAggregateStatus) {
      const apiStatus = finalAggregateStatus.charAt(0).toUpperCase() + finalAggregateStatus.slice(1);
      ordersService.updateStatus(orderId, apiStatus).catch(err => {
        console.error('[AppState] Syncing department status failed:', err.message);
      });
    }
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
