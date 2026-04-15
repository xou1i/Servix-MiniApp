import { useState, useCallback } from 'react';
import { authService } from '../services/auth.service';

/**
 * useAuth — Authentication hook.
 *
 * Provides:
 *   user        → { id, firstName, lastName, role } | null
 *   role        → user.role.toLowerCase() | ''   (backward compatible)
 *   login(email, password, selectedRole) → throws on mismatch
 *   logout()
 *   loading     → true during API call
 *   error       → string | null
 */
export function useAuth() {
  const [user,    setUser]    = useState(() => authService.getStoredUser());
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // Lowercase role key — compatible with existing app (ROLES object keys)
  const role = user?.role?.toLowerCase() ?? '';

  const login = useCallback(async (email, password, selectedRole) => {
    setLoading(true);
    setError(null);

    try {
      // 1. POST /Auth/login → get token + user
      //    selectedRole is passed so dev mode can return the correct mock user
      const { token, user: loginUser } = await authService.login({ email, password }, selectedRole);
      // Token is already persisted inside authService.login()

      // 2. Validate role matches selection
      const returnedRole = loginUser?.role?.toLowerCase();
      if (returnedRole !== selectedRole.toLowerCase()) {
        authService.logout(); // Clean up token
        throw new Error(
          `الدور المحدد (${selectedRole}) لا يتطابق مع دورك الفعلي (${loginUser.role})`
        );
      }

      // 3. GET /Auth/me → full profile
      const me = await authService.getCurrentUser();

      // 4. Persist and set
      authService.persistUser(me);
      setUser(me);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'فشل تسجيل الدخول. تحقق من البريد وكلمة المرور.';
      setError(msg);
      authService.logout();
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setError(null);
  }, []);

  return { user, role, login, logout, loading, error, setError };
}
