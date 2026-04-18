import { useState, useCallback } from 'react';
import { authService } from '../services/auth.service';
import { classifyError, ERROR_TYPES } from '../services/api';

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
 *   errorType   → ERROR_TYPES value | null (for UI conditional rendering)
 */
export function useAuth() {
  const [user,      setUser]      = useState(() => authService.getStoredUser());
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [errorType, setErrorType] = useState(null);

  // Lowercase role key — compatible with existing app (ROLES object keys)
  const role = user?.role?.toLowerCase() ?? '';

  const login = useCallback(async (email, password, selectedRole) => {
    setLoading(true);
    setError(null);
    setErrorType(null);

    try {
      // 1. POST /api/v1/Auth/login → get token + user
      //    selectedRole is passed so dev mode can return the correct mock user
      const { token, user: loginUser } = await authService.login({ email, password }, selectedRole);
      // Token is already persisted inside authService.login()

      // 2. Validate role matches selection
      const returnedRole = loginUser?.role?.toLowerCase();
      if (returnedRole !== selectedRole.toLowerCase()) {
        authService.logout(); // Clean up token
        const mismatchMsg = `الدور المحدد (${selectedRole}) لا يتطابق مع دورك الفعلي (${loginUser?.role || 'غير معروف'})`;
        setError(mismatchMsg);
        setErrorType('ROLE_MISMATCH');
        throw new Error(mismatchMsg);
      }

      // 3. Persist and set (Use loginUser directly as it contains all needed info)
      authService.persistUser(loginUser);
      setUser(loginUser);
    } catch (err) {
      // If we already set a specific error (like role mismatch), don't overwrite
      if (!error) {
        const classified = classifyError(err);

        // Pick language-appropriate message
        let msg;
        switch (classified.type) {
          case ERROR_TYPES.AUTH_EXPIRED:
            msg = 'بيانات الدخول غير صحيحة. تحقق من البريد وكلمة المرور.';
            break;
          case ERROR_TYPES.GATEWAY_ERROR:
            msg = 'السيرفر غير متاح حالياً. حاول مرة أخرى بعد قليل.';
            break;
          case ERROR_TYPES.NETWORK_ERROR:
            msg = 'لا يوجد اتصال بالسيرفر. تحقق من الشبكة.';
            break;
          case ERROR_TYPES.TIMEOUT:
            msg = 'انتهت مهلة الاتصال. حاول مرة أخرى.';
            break;
          case ERROR_TYPES.VALIDATION:
            msg = classified.messageAr || 'تحقق من المدخلات.';
            break;
          default:
            msg =
              err.response?.data?.message ||
              err.message ||
              'فشل تسجيل الدخول. تحقق من البريد وكلمة المرور.';
        }

        setError(msg);
        setErrorType(classified.type);
      }

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
    setErrorType(null);
  }, []);

  return { user, role, login, logout, loading, error, errorType, setError };
}
