import api, { unwrap } from './api';

export const paymentsService = {
  /**
   * POST /api/v1/Payments
   * Create a payment for an order (Cashier only)
   * @param {{ orderId: string, amount: number, method: 'cash' | 'card' }} payload
   */
  create: async (payload) => {
    const { data } = await api.post('/Payments', payload);
    return unwrap(data);
  },

  /**
   * PATCH /api/v1/Payments/{id}/status
   * Update payment status
   */
  updateStatus: async (id, status) => {
    const { data } = await api.patch(`/Payments/${id}/status`, { status });
    return unwrap(data);
  },

  /**
   * POST /api/v1/Payments/{id}/refund
   * Refund a payment
   */
  refund: async (id) => {
    const { data } = await api.post(`/Payments/${id}/refund`);
    return unwrap(data);
  },
};
