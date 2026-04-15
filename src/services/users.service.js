import api, { unwrap } from './api';

export const usersService = {
  /**
   * GET /api/v1/Users
   * Returns all users/staff
   */
  getAll: async () => {
    const { data } = await api.get('/Users');
    return unwrap(data);
  },

  /**
   * POST /api/v1/Users/staff
   * Create a new staff member
   * @param {{ firstName: string, lastName: string, email: string, password: string, role: string }} payload
   */
  createStaff: async (payload) => {
    const { data } = await api.post('/Users/staff', payload);
    return unwrap(data);
  },
};
