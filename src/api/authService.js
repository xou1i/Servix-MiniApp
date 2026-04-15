import axios from 'axios';

// ── Axios instance ──────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT automatically ──────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('servix_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 globally ─────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('servix_token');
      localStorage.removeItem('servix_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

// ── Auth endpoints ─────────────────────────────────────────────────────────
export const authService = {
  /**
   * POST /api/v1/Auth/login
   * Returns { token, user: { id, firstName, lastName, role } }
   */
  login: async ({ email, password }) => {
    const { data } = await api.post('/Auth/login', { email, password });
    return data; // { token, user }
  },

  /**
   * GET /api/v1/Auth/me
   * Returns { id, firstName, lastName, role }
   */
  me: async () => {
    const { data } = await api.get('/Auth/me');
    return data;
  },
};

export default api;
