// menu.service.js
import api, { unwrap } from './api';

export const menuService = {
  /**
   * GET /api/v1/Menu
   * Returns array of menu items
   * Each item has: id, name, price, target_department, isAvailable, ...
   */
  getAll: async () => {
    const { data } = await api.get('/Menu');
    const result = unwrap(data);
    return Array.isArray(result) ? result : [];
  },

  /**
   * GET /api/v1/Menu/category/{categoryId}
   * Filter menu items by category
   */
  getByCategory: async (categoryId) => {
    const { data } = await api.get(`/Menu/category/${categoryId}`);
    const result = unwrap(data);
    return Array.isArray(result) ? result : [];
  },

  /**
   * GET /api/v1/Departments
   */
  getDepartments: async () => {
    const { data } = await api.get('/Departments');
    return unwrap(data);
  },

  /**
   * GET /api/v1/Categories
   */
  getCategories: async () => {
    const { data } = await api.get('/Categories');
    return unwrap(data);
  },
};
