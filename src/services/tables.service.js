import api, { unwrap } from './api';

export const tablesService = {
  /**
   * GET /api/v1/Tables
   * Returns flat array of tables (unwraps { success, data } envelope)
   */
  getAll: async () => {
    const { data } = await api.get('/Tables');
    return unwrap(data);
  },

  /**
   * GET /api/v1/Tables/available
   * Returns only available tables
   */
  getAvailable: async () => {
    const { data } = await api.get('/Tables/available');
    return unwrap(data);
  },

  /**
   * GET /api/public/tables/by-code/{code}
   * Get table via QR code scan
   *
   * NOTE: This endpoint is under /api/public (no /v1), so we use
   * an absolute path relative to the origin, bypassing the baseURL.
   */
  getByQrCode: async (code) => {
    // Use full path to avoid /api/v1 baseURL prefix
    // The URL safety interceptor skips paths containing /api/public
    const { data } = await api.get(`/api/public/tables/by-code/${code}`, {
      baseURL: '', // Override baseURL to use absolute path
    });
    return unwrap(data);
  },
};
