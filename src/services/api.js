import axios from 'axios';

// ── Shared Axios Instance ──────────────────────────────────────────────────
// Every service file imports this single instance.
// JWT is auto-attached. 401 triggers logout.
// Retry on 502/503/network. Envelope unwrapping via unwrap().
// ────────────────────────────────────────────────────────────────────────────

const api = axios.create({
  // Use root in dev to trigger proxy, or full origin in prod
  baseURL: import.meta.env.DEV ? '' : (import.meta.env.VITE_BACKEND_ORIGIN || 'https://restaurantsystem-oe83.onrender.com'),
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json'
  },
});

// ── Unwrap Helper ───────────────────────────────────────────────────────────
export function unwrap(axiosData) {
  if (!axiosData) return axiosData;
  if (axiosData && typeof axiosData === 'object') {
    if ('data' in axiosData && !Array.isArray(axiosData)) {
      return axiosData.data;
    }
  }
  return axiosData;
}

// ── Error Classification ────────────────────────────────────────────────────
const ERROR_TYPES = {
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION: 'VALIDATION',
  SERVER_ERROR: 'SERVER_ERROR',
  GATEWAY_ERROR: 'GATEWAY_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN',
};

export function classifyError(error) {
  if (error.code === 'ECONNABORTED') {
    return { type: ERROR_TYPES.TIMEOUT, status: null, message: 'Request timed out.', messageAr: 'انتهت مهلة الطلب.', retryable: true };
  }
  if (!error.response) {
    return { type: ERROR_TYPES.NETWORK_ERROR, status: null, message: 'Network error.', messageAr: 'خطأ في الشبكة.', retryable: true };
  }

  const status = error.response.status;
  const serverMessage = error.response?.data?.message || '';

  switch (status) {
    case 400: return { type: ERROR_TYPES.VALIDATION, status, message: serverMessage || 'Invalid request.', messageAr: serverMessage || 'طلب غير صالح.', retryable: false };
    case 401: return { type: ERROR_TYPES.AUTH_EXPIRED, status, message: 'Session expired.', messageAr: 'انتهت الجلسة.', retryable: false };
    case 403: return { type: ERROR_TYPES.FORBIDDEN, status, message: 'Forbidden.', messageAr: 'غير مسموح.', retryable: false };
    case 404: return { type: ERROR_TYPES.NOT_FOUND, status, message: 'Not found.', messageAr: 'غير موجود.', retryable: false };
    default: return { type: ERROR_TYPES.UNKNOWN, status, message: 'Error occurred.', messageAr: 'حدث خطأ.', retryable: false };
  }
}

export { ERROR_TYPES };

// ── Request Interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // 1. Attach Token
    const token = localStorage.getItem('servix_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Build URL: ensure it starts with /api/v1 if it's a relative path
    if (config.url && !config.url.startsWith('http')) {
      // If it doesn't already contain /api/v1 or /api/public, prepend /api/v1
      if (!config.url.includes('/api/v1') && !config.url.includes('/api/public')) {
        config.url = `/api/v1${config.url.startsWith('/') ? '' : '/'}${config.url}`;
      }
    }

    if (import.meta.env.DEV) {
      console.log(`[API] ➡️ ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor: global 401 handler + dev logging ──────────────────
api.interceptors.response.use(
  (res) => {
    if (import.meta.env.DEV) {
      console.log(`[API] ✅ ${res.status} ${res.config.url}`);
    }
    return res;
  },
  (err) => {
    if (import.meta.env.DEV) {
      const status = err.response?.status || 'NETWORK';
      const data = err.response?.data || {};
      console.warn(`[API] ❌ ${status} ${err.config?.url}`, {
        message: err.message,
        serverData: data
      });
    }

    if (err.response?.status === 401) {
      localStorage.removeItem('servix_token');
      localStorage.removeItem('servix_user');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(err);
  },
);

// ── Retry Interceptor: auto-retry on 502/503/network errors ────────────────
// Max 2 retries with exponential backoff (1s, 3s)
api.interceptors.response.use(null, async (error) => {
  const config = error.config;
  if (!config) return Promise.reject(error);

  // Initialize retry count
  config.__retryCount = config.__retryCount || 0;
  const MAX_RETRIES = 2;

  // Only retry on retryable errors
  const isRetryable =
    !error.response || // Network error
    error.response.status === 502 ||
    error.response.status === 503;

  if (!isRetryable || config.__retryCount >= MAX_RETRIES) {
    return Promise.reject(error);
  }

  config.__retryCount += 1;
  const delay = config.__retryCount === 1 ? 1000 : 3000;

  if (import.meta.env.DEV) {
    console.log(`[API] 🔄 Retry ${config.__retryCount}/${MAX_RETRIES} in ${delay}ms — ${config.url}`);
  }

  await new Promise((resolve) => setTimeout(resolve, delay));
  return api(config);
});

export default api;
