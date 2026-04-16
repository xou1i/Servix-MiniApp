import { useOrderStore } from '../store/useOrderStore';
import { ordersService } from '../../../services/orders.service';

/**
 * OrderSyncService — Bridge between UI state (Zustand) and Backend API.
 *
 * Phase 1: Uses ordersService (REST) for order creation.
 * Phase 2 (future): Add SignalR HubConnection for real-time events
 *   (NewOrderPlaced, OrderStatusChanged, NewItemsToPrepare, MyOrderStatusUpdate)
 */

class OrderSyncService {
  constructor() {
    this.connection = null;  // Future: HubConnectionBuilder instance
    this.isConnected = false;
  }

  // ── Connect ──────────────────────────────────────────────────────────────
  connect() {
    console.log('[OrderSync] Connected (REST mode). SignalR will be added in Phase 2.');
    this.isConnected = true;

    // TODO Phase 2: Initialize SignalR
    // this.connection = new HubConnectionBuilder()
    //   .withUrl('/orderHub', { accessTokenFactory: () => localStorage.getItem('servix_token') })
    //   .withAutomaticReconnect()
    //   .build();
    //
    // this.connection.on('OrderStatusChanged', (data) => { ... });
    // this.connection.on('NewOrderPlaced', (data) => { ... });
    // await this.connection.start();
  }

  // ── Disconnect ───────────────────────────────────────────────────────────
  disconnect() {
    this.isConnected = false;
    // TODO Phase 2: this.connection?.stop();
    console.log('[OrderSync] Disconnected.');
  }

  // ── Send Order via REST API ──────────────────────────────────────────────
  async sendOrder(orderPayload) {
    const { context, cart, orderNote } = orderPayload;

    // Build the API request body matching POST /api/v1/Orders
    const apiPayload = {
      tableId: context.type === 'dine-in' ? context.tableId : null,
      orderType: context.type === 'dine-in' ? 'dineIn' : context.type,  // 'dineIn' | 'takeaway' | 'delivery'
      items: cart.map(item => ({
        menuItemId: item.productId,
        quantity: item.qty,
      })),
    };

    console.log('[OrderSync] Submitting order:', apiPayload);

    // Call the real API
    const result = await ordersService.create(apiPayload);

    console.log('[OrderSync] Order created successfully:', result);
    return result; // { id, status, totalAmount, createdAt }
  }
}

// Export singleton
export const orderSyncService = new OrderSyncService();
