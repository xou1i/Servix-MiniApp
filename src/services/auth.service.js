import api from './api';

const TOKEN_KEY = 'servix_token';
const USER_KEY  = 'servix_user';

// ── Dev Mode Flag ──────────────────────────────────────────────────────────
// Reads from .env → set VITE_USE_MOCK_AUTH=true to bypass real API
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

// ── Mock responses per role (used in dev mode only) ────────────────────────
const MOCK_USERS = {
  cashier: { id: 'dev-cashier-001', firstName: 'Dev', lastName: 'Cashier', role: 'Cashier' },
  waiter:  { id: 'dev-waiter-001',  firstName: 'Dev', lastName: 'Waiter',  role: 'Waiter' },
  chef:    { id: 'dev-chef-001',    firstName: 'Dev', lastName: 'Chef',    role: 'Chef' },
  barista: { id: 'dev-barista-001', firstName: 'Dev', lastName: 'Barista', role: 'Barista' },
};

function getMockResponse(selectedRole) {
  const roleKey = selectedRole?.toLowerCase() || 'cashier';
  const user = MOCK_USERS[roleKey] || MOCK_USERS.cashier;
  return { token: `dev-token-${roleKey}`, user };
}

// ── Auth Service ───────────────────────────────────────────────────────────
export const authService = {
  /**
   * POST /api/v1/Auth/login
   * In dev mode: returns mock data instantly, matching the selected role.
   * In prod mode: calls real API.
   */
  login: async ({ email, password }, selectedRole) => {
    if (USE_MOCK_AUTH) {
      console.log('[Auth] 🟡 Dev mode — skipping API, using mock auth');
      await new Promise(r => setTimeout(r, 300)); // Simulate network feel

      const mock = getMockResponse(selectedRole);
      localStorage.setItem(TOKEN_KEY, mock.token);
      return mock;
    }

    // ── Real API ──
    const { data } = await api.post('/Auth/login', { email, password });
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }
    return data; // { token, user }
  },

  /**
   * GET /api/v1/Auth/me
   * In dev mode: returns stored mock user.
   */
  getCurrentUser: async () => {
    if (USE_MOCK_AUTH) {
      const stored = authService.getStoredUser();
      return stored || MOCK_USERS.cashier;
    }

    const { data } = await api.get('/Auth/me');
    return data;
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
   * Clear all auth state
   */
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Whether dev mock auth is active (useful for UI indicators)
   */
  isDevMode: USE_MOCK_AUTH,
};
