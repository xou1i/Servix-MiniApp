// orders.service.js
import api, { unwrap } from './api';

export const ordersService = {
  /**
   * GET /api/v1/Orders
   * Optionally filter by status and/or departmentId
   * @param {{ status?: string, departmentId?: string }} [filters]
   */
  getAll: async (filters = {}) => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.departmentId) params.departmentId = filters.departmentId;

    const { data } = await api.get('/Orders', { params });
    const result = unwrap(data);
    if (Array.isArray(result)) return result;
    if (result && typeof result === 'object') {
      if (Array.isArray(result.items)) return result.items;
      if (Array.isArray(result.data)) return result.data;
      if (Array.isArray(result.orders)) return result.orders;
      if (Array.isArray(result.result)) return result.result;
      if (Array.isArray(result.value)) return result.value;
      
      // Deep fallback search (find any array within the top level object)
      const possibleArray = Object.values(result).find(val => Array.isArray(val));
      if (possibleArray) return possibleArray;
    }
    console.warn("[OrdersService] Failed to extract array from API response:", result);
    return [];
  },

  /**
   * GET /api/v1/Orders/{id}
   * Full order details
   */
  getById: async (id) => {
    const { data } = await api.get(`/Orders/${id}`);
    return unwrap(data);
  },

  /**
   * POST /api/v1/Orders
   * Create a new order (Waiter / Cashier)
   * @param {{ tableId?: string, orderType: string, items: Array<{ menuItemId: string, quantity: number }> }} payload
   * @returns {{ id, status, totalAmount, createdAt }}
   */
  create: async (payload) => {
    const { data } = await api.post('/Orders', payload);
    return unwrap(data);
  },

  /**
   * PATCH /api/v1/Orders/{id}/status
   * Update order status (preparing | ready | served | completed)
   * Note: Backend computes global_status automatically
   */
  updateStatus: async (id, status) => {
    const { data } = await api.patch(`/Orders/${id}/status`, { status });
    return unwrap(data);
  },
};
