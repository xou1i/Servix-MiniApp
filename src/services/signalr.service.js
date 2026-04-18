import { HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';

// ── SignalR Service ─────────────────────────────────────────────────────────
// Manages the connection to the backend's /orderHub for real-time updates.
//
// Events:
//   NewOrderPlaced      → new order was created by another user
//   OrderStatusChanged  → an order's status was updated
//   NewItemsToPrepare   → new items assigned to kitchen/barista dept
//   MyOrderStatusUpdate → status update for an order the current user owns
// ────────────────────────────────────────────────────────────────────────────

let connection = null;

/**
 * Build the SignalR hub URL.
 * In dev mode (Vite proxy), we use a relative path.
 * In production, we use the full backend origin.
 */
function getHubUrl() {
  const backendOrigin = import.meta.env.VITE_BACKEND_ORIGIN || 'https://restaurantsystem-oe83.onrender.com';
  return `${backendOrigin}/orderHub`;
}

/**
 * Create and configure a new SignalR connection.
 * @param {string} token - JWT token for authentication
 * @returns {HubConnection}
 */
export function createConnection(token) {
  const hubUrl = getHubUrl();

  connection = new HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => token,
      // Use WebSockets first, fall back to Server-Sent Events, then Long Polling
      transport: HttpTransportType.WebSockets | HttpTransportType.ServerSentEvents | HttpTransportType.LongPolling,
      // Skip negotiation for WebSockets (faster connection)
      skipNegotiation: false,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // Retry schedule in ms
    .configureLogging(import.meta.env.DEV ? LogLevel.Information : LogLevel.Warning)
    .build();

  // ── Connection lifecycle logging ──────────────────────────────────────
  connection.onreconnecting((error) => {
    console.warn('[SignalR] 🔄 Reconnecting...', error?.message);
  });

  connection.onreconnected((connectionId) => {
    console.log('[SignalR] ✅ Reconnected. Connection ID:', connectionId);
  });

  connection.onclose((error) => {
    console.warn('[SignalR] ❌ Connection closed.', error?.message);
  });

  return connection;
}

/**
 * Start the SignalR connection.
 * @returns {Promise<void>}
 */
export async function startConnection() {
  if (!connection) {
    console.warn('[SignalR] No connection created. Call createConnection() first.');
    return;
  }

  try {
    await connection.start();
    console.log('[SignalR] ✅ Connected to /orderHub');
  } catch (err) {
    console.error('[SignalR] ❌ Failed to connect:', err.message);
    // Will auto-retry via withAutomaticReconnect
  }
}

/**
 * Stop and dispose the SignalR connection.
 */
export async function stopConnection() {
  if (connection) {
    try {
      await connection.stop();
      console.log('[SignalR] 🛑 Disconnected from /orderHub');
    } catch (err) {
      console.warn('[SignalR] Error stopping connection:', err.message);
    }
    connection = null;
  }
}

/**
 * Subscribe to a SignalR event.
 * @param {string} eventName
 * @param {Function} callback
 */
export function onEvent(eventName, callback) {
  if (!connection) {
    console.warn('[SignalR] Cannot subscribe — no connection.');
    return;
  }
  connection.on(eventName, callback);
}

/**
 * Unsubscribe from a SignalR event.
 * @param {string} eventName
 * @param {Function} [callback] - If omitted, removes all handlers for the event.
 */
export function offEvent(eventName, callback) {
  if (!connection) return;
  if (callback) {
    connection.off(eventName, callback);
  } else {
    connection.off(eventName);
  }
}

/**
 * Get current connection state.
 * @returns {'Connected' | 'Connecting' | 'Reconnecting' | 'Disconnected' | null}
 */
export function getConnectionState() {
  return connection?.state ?? null;
}

// ── SignalR Event Names (constants to avoid typos) ──────────────────────────
export const SIGNALR_EVENTS = {
  NEW_ORDER_CREATED: 'NewOrderCreated',
  ORDER_STATUS_UPDATED: 'OrderStatusUpdated',
  ORDER_DELETED: 'OrderDeleted',
  ORDER_ITEM_ADDED: 'OrderItemAdded',
  ORDER_ITEM_REMOVED: 'OrderItemRemoved',
  NEW_ITEMS_TO_PREPARE: 'NewItemsToPrepare',
  MY_ORDER_STATUS_UPDATE: 'MyOrderStatusUpdate',
};

export const signalRService = {
  createConnection,
  startConnection,
  stopConnection,
  onEvent,
  offEvent,
  getConnectionState,
  SIGNALR_EVENTS,
};
