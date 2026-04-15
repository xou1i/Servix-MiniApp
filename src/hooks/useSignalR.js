import { useEffect, useRef, useCallback } from 'react';
import {
  createConnection,
  startConnection,
  stopConnection,
  onEvent,
  offEvent,
  SIGNALR_EVENTS,
} from '../services/signalr.service';
import { authService } from '../services/auth.service';

/**
 * useSignalR — Real-time order updates via SignalR.
 *
 * Connects to /orderHub when authenticated, subscribes to events
 * based on the user's role, and calls handlers to update app state.
 *
 * @param {Object} params
 * @param {string} params.role - Current user role key (lowercase)
 * @param {Function} params.onNewOrder - Called when a new order is placed (any role)
 * @param {Function} params.onStatusChanged - Called when an order status changes
 * @param {Function} params.onNewItems - Called when new items need preparing (chef/barista)
 * @param {Function} params.onMyOrderUpdate - Called for user's own order updates (waiter/cashier)
 */
export function useSignalR({ role, onNewOrder, onStatusChanged, onNewItems, onMyOrderUpdate }) {
  const connectedRef = useRef(false);

  // Stable callback refs to avoid re-subscribing on every render
  const onNewOrderRef = useRef(onNewOrder);
  const onStatusChangedRef = useRef(onStatusChanged);
  const onNewItemsRef = useRef(onNewItems);
  const onMyOrderUpdateRef = useRef(onMyOrderUpdate);

  useEffect(() => { onNewOrderRef.current = onNewOrder; }, [onNewOrder]);
  useEffect(() => { onStatusChangedRef.current = onStatusChanged; }, [onStatusChanged]);
  useEffect(() => { onNewItemsRef.current = onNewItems; }, [onNewItems]);
  useEffect(() => { onMyOrderUpdateRef.current = onMyOrderUpdate; }, [onMyOrderUpdate]);

  useEffect(() => {
    // Only connect if authenticated
    const token = authService.getToken();
    if (!token || !role || authService.isDevMode) {
      return;
    }

    // Avoid double-connect in StrictMode
    if (connectedRef.current) return;
    connectedRef.current = true;

    // Create and start connection
    createConnection(token);

    // ── Event handlers (wrapped to use latest refs) ────────────────────
    const handleNewOrder = (data) => {
      if (import.meta.env.DEV) console.log('[SignalR] 📦 NewOrderPlaced:', data);
      onNewOrderRef.current?.(data);
    };

    const handleStatusChanged = (data) => {
      if (import.meta.env.DEV) console.log('[SignalR] 🔄 OrderStatusChanged:', data);
      onStatusChangedRef.current?.(data);
    };

    const handleNewItems = (data) => {
      if (import.meta.env.DEV) console.log('[SignalR] 🍳 NewItemsToPrepare:', data);
      onNewItemsRef.current?.(data);
    };

    const handleMyOrderUpdate = (data) => {
      if (import.meta.env.DEV) console.log('[SignalR] 📋 MyOrderStatusUpdate:', data);
      onMyOrderUpdateRef.current?.(data);
    };

    // ── Subscribe based on role ────────────────────────────────────────
    // All roles get new orders and status changes
    onEvent(SIGNALR_EVENTS.NEW_ORDER_PLACED, handleNewOrder);
    onEvent(SIGNALR_EVENTS.ORDER_STATUS_CHANGED, handleStatusChanged);

    // Chef/Barista get new items to prepare
    if (role === 'chef' || role === 'barista') {
      onEvent(SIGNALR_EVENTS.NEW_ITEMS_TO_PREPARE, handleNewItems);
    }

    // Waiter/Cashier get updates for their own orders
    if (role === 'waiter' || role === 'cashier') {
      onEvent(SIGNALR_EVENTS.MY_ORDER_STATUS_UPDATE, handleMyOrderUpdate);
    }

    // Start the connection
    startConnection();

    // ── Cleanup on unmount or role change ──────────────────────────────
    return () => {
      offEvent(SIGNALR_EVENTS.NEW_ORDER_PLACED, handleNewOrder);
      offEvent(SIGNALR_EVENTS.ORDER_STATUS_CHANGED, handleStatusChanged);
      offEvent(SIGNALR_EVENTS.NEW_ITEMS_TO_PREPARE, handleNewItems);
      offEvent(SIGNALR_EVENTS.MY_ORDER_STATUS_UPDATE, handleMyOrderUpdate);
      stopConnection();
      connectedRef.current = false;
    };
  }, [role]);
}
