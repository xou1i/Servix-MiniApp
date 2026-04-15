import api, { unwrap } from './api';

export const ordersService = {
  /**
   * GET /api/v1/Orders
   * Optionally filter by status and/or departmentId
   * @param {{ status?: string, departmentId?: string }} [filters]
   */
  getAll: async (filters = {}) => {
    const params = {};
    if (filters.status)       params.status       = filters.status;
    if (filters.departmentId) params.departmentId = filters.departmentId;

    const { data } = await api.get('/Orders', { params });
    const result = unwrap(data);
    return Array.isArray(result) ? result : [];
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
