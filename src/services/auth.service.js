import api, { unwrap } from './api';

const TOKEN_KEY = 'servix_token';
const USER_KEY  = 'servix_user';

// ── Auth Service ───────────────────────────────────────────────────────────
export const authService = {
  /**
   * POST /api/v1/Auth/login
   * Calls real API.
   *
   * Response handling:
   *   - Envelope format: { success, data: { token, user } } → unwrap() extracts inner data
   *   - Direct format:   { token, user } → unwrap() returns as-is
   */
  login: async ({ email, password }) => {
    // ── Real API ──
    const { data } = await api.post('/Auth/login', { email, password });
    const result = unwrap(data); // handles { success, data: { token, user } } OR { token, user }

    if (result.token) {
      localStorage.setItem(TOKEN_KEY, result.token);
    } else {
      console.warn('[Auth] ⚠️ Login response missing token:', result);
    }

    return result; // { token, user }
  },

  /**
   * GET /api/v1/Auth/me
   * Requires: Authorization: Bearer {token} (auto-attached by interceptor)
   * Returns: { id, firstName, lastName, role } (after unwrapping envelope)
   */
  getCurrentUser: async () => {
    const { data } = await api.get('/Auth/me');
    return unwrap(data); // extracts from { success, data: { id, ... } }
  },

  /**
   * Persist user info locally
   */
  persistUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Read persisted user (sync — no API call)
   */
  getStoredUser: () => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if user has a stored token
   */
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get the stored token (for SignalR or external use)
   */
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Clear all auth state
   */
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
