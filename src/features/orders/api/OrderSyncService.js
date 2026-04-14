import { useOrderStore } from '../store/useOrderStore';

/**
 * 🚀 SignalR / WebSocket Integration Layer (Stub)
 * 
 * This service acts as the bridge between the UI State (Zustand) and the Backend Server State.
 * In a production environment, this is where the `HubConnectionBuilder` from `@microsoft/signalr` lives.
 */

class OrderSyncService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.mockTimers = [];
  }

  // 1. Initialize Connection
  connect() {
    console.log('[SignalR Stub] Connecting to /hubs/orders...');
    this.isConnected = true;
    
    // Simulate real-time backend pushing an event to clients
    console.log('[SignalR Stub] Connected successfully. Listening for events.');
  }

  // 2. Disconnect/Cleanup
  disconnect() {
    this.isConnected = false;
    this.mockTimers.forEach(clearTimeout);
    this.mockTimers = [];
    console.log('[SignalR Stub] Disconnected.');
  }

  // 3. Outgoing: Send Order to Backend
  async sendOrder(orderPayload) {
    if (!this.isConnected) throw new Error("Disconnected from server");

    console.log('[SignalR Stub] Transmitting Order Payload:', orderPayload);

    // Simulate network delay for submission
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Once sent successfully, we can simulate the "Kitchen" picking it up 5 seconds later
    const timerId = setTimeout(() => {
      console.log('[SignalR Stub] 🔔 Incoming Event: Kitchen marked order as PREPARING (Locked)');
      // Directly mutate the Zustand store from the Sync Bridge (Single Source of Truth)
      useOrderStore.getState().syncOrderLifecycle('locked');
    }, 5000);

    this.mockTimers.push(timerId);

    return { success: true, orderId: `ord_${Math.floor(Math.random() * 10000)}` };
  }

  // 4. Incoming (Stub): Receive individual item updates from Kitchen
  simulateKitchenItemReady(cartItemId) {
    // In real prod, this is triggered via `this.connection.on("ReceiveItemStatusUpdate", (data) => ...)`
    useOrderStore.getState().syncItemKitchenStatus(cartItemId, 'ready');
  }
}

// Export a singleton instance
export const orderSyncService = new OrderSyncService();
