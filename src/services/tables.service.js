import api from './api';

export const tablesService = {
  /**
   * GET /api/v1/Tables
   * Returns flat array of tables (unwraps { success, data } envelope)
   */
  getAll: async () => {
    const { data } = await api.get('/Tables');
    // API wraps in { success: true, data: [...] }
    return data.data ?? data;
  },

  /**
   * GET /api/v1/Tables/available
   * Returns only available tables
   */
  getAvailable: async () => {
    const { data } = await api.get('/Tables/available');
    return data.data ?? data;
  },

  /**
   * GET /api/public/tables/by-code/{code}
   * Get table via QR code scan
   */
  getByQrCode: async (code) => {
    const { data } = await api.get(`/public/tables/by-code/${code}`);
    return data.data ?? data;
  },
};
