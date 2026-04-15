import { useState, useCallback } from 'react';
import { authService } from '../api/authService';

const TOKEN_KEY = 'servix_token';
const USER_KEY  = 'servix_user';

function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * useAuth — replaces the old useRole hook.
 *
 * Exposes:
 *   user        → { id, firstName, lastName, role } | null
 *   role        → user.role.toLowerCase() | ''   (keeps compat with old code)
 *   login(email, password, selectedRole) → throws on mismatch / error
 *   logout()
 *   loading     → true while API call is in-flight
 *   error       → string | null
 */
export function useAuth() {
  const [user,    setUser]    = useState(loadUser);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // role key compatible with existing app (lowercase)
  const role = user?.role?.toLowerCase() ?? '';

  const login = useCallback(async (email, password, selectedRole) => {
    setLoading(true);
    setError(null);

    try {
      // 1️⃣ Login → get token + user from response body
      const { token, user: loginUser } = await authService.login({ email, password });

      // 2️⃣ Verify role matches the selected role
      const returnedRole = loginUser.role?.toLowerCase();
      if (returnedRole !== selectedRole.toLowerCase()) {
        throw new Error(
          `الدور المحدد (${selectedRole}) لا يتطابق مع دورك الفعلي (${loginUser.role})`
        );
      }

      // 3️⃣ Store token first so the interceptor can use it for /me
      localStorage.setItem(TOKEN_KEY, token);

      // 4️⃣ Fetch full user profile from /me
      const me = await authService.me();

      // 5️⃣ Persist and set state
      localStorage.setItem(USER_KEY, JSON.stringify(me));
      setUser(me);
    } catch (err) {
      // Friendly error messages
      const msg =
        err.message ||
        err.response?.data?.message ||
        'فشل تسجيل الدخول. تحقق من البريد وكلمة المرور.';
      setError(msg);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      throw err; // let the form re-throw to keep button state correct
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setError(null);
  }, []);

  return { user, role, login, logout, loading, error, setError };
}
