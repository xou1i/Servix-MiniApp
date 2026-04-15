import api from './api';

export const menuService = {
  /**
   * GET /api/v1/Menu
   * Returns array of menu items
   * Each item has: id, name, price, target_department, isAvailable, ...
   */
  getAll: async () => {
    const { data } = await api.get('/Menu');
    // Normalize: API may return array directly or inside { data }
    return Array.isArray(data) ? data : (data.data ?? []);
  },

  /**
   * GET /api/v1/Menu/category/{categoryId}
   * Filter menu items by category
   */
  getByCategory: async (categoryId) => {
    const { data } = await api.get(`/Menu/category/${categoryId}`);
    return Array.isArray(data) ? data : (data.data ?? []);
  },
};
