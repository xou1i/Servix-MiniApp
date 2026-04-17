import axios from 'axios';

// ── Shared Axios Instance ──────────────────────────────────────────────────
// Every service file imports this single instance.
// JWT is auto-attached. 401 triggers logout.
// Retry on 502/503/network. Envelope unwrapping via unwrap().
// ────────────────────────────────────────────────────────────────────────────

const api = axios.create({
  // Enforce relative path in development to use Vite proxy (which handles CORS and Localtunnel headers)
  baseURL: import.meta.env.PROD && import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.startsWith('http') 
    ? import.meta.env.VITE_API_BASE_URL 
    : '/api/v1',
  timeout: 15_000,
  headers: { 
    'Content-Type': 'application/json'
  },
});

// ── Unwrap Helper ───────────────────────────────────────────────────────────
// Backend uses standard envelope: { success, message, data, errors }
// This helper extracts the inner `data` if the envelope is present,
// Otherwise returns the raw response as-is (backward compatible).
// ────────────────────────────────────────────────────────────────────────────
export function unwrap(axiosData) {
  if (!axiosData) return axiosData;
  if (axiosData && typeof axiosData === 'object') {
    // Aggressively extract the inner 'data' if it's an envelope
    if ('data' in axiosData && !Array.isArray(axiosData)) {
      return axiosData.data;
    }
  }
  return axiosData;
}

// ── Error Classification ────────────────────────────────────────────────────
// Returns a structured error object for UI consumption.
// ────────────────────────────────────────────────────────────────────────────
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
  // Axios timeout
  if (error.code === 'ECONNABORTED') {
    return {
      type: ERROR_TYPES.TIMEOUT,
      status: null,
      message: 'Request timed out. Please try again.',
      messageAr: 'انتهت مهلة الطلب. حاول مرة أخرى.',
      retryable: true,
    };
  }

  // No response at all — network / tunnel dead
  if (!error.response) {
    return {
      type: ERROR_TYPES.NETWORK_ERROR,
      status: null,
      message: 'Network error. Check your connection or the server may be down.',
      messageAr: 'خطأ في الشبكة. تحقق من الاتصال أو قد يكون السيرفر معطل.',
      retryable: true,
    };
  }

  const status = error.response.status;
  const serverMessage = error.response?.data?.message || '';

  switch (status) {
    case 400:
      return {
        type: ERROR_TYPES.VALIDATION,
        status,
        message: serverMessage || 'Invalid request. Please check your input.',
        messageAr: serverMessage || 'طلب غير صالح. تحقق من المدخلات.',
        retryable: false,
      };
    case 401:
      return {
        type: ERROR_TYPES.AUTH_EXPIRED,
        status,
        message: 'Session expired. Please log in again.',
        messageAr: 'انتهت الجلسة. سجل الدخول مرة أخرى.',
        retryable: false,
      };
    case 403:
      return {
        type: ERROR_TYPES.FORBIDDEN,
        status,
        message: 'You do not have permission to perform this action.',
        messageAr: 'ليس لديك صلاحية لتنفيذ هذا الإجراء.',
        retryable: false,
      };
    case 404:
      return {
        type: ERROR_TYPES.NOT_FOUND,
        status,
        message: serverMessage || 'Resource not found.',
        messageAr: serverMessage || 'المورد غير موجود.',
        retryable: false,
      };
    case 502:
    case 503:
      return {
        type: ERROR_TYPES.GATEWAY_ERROR,
        status,
        message: 'Server is temporarily unavailable. Retrying...',
        messageAr: 'السيرفر غير متاح مؤقتاً. جاري إعادة المحاولة...',
        retryable: true,
      };
    default:
      if (status >= 500) {
        return {
          type: ERROR_TYPES.SERVER_ERROR,
          status,
          message: serverMessage || 'Server error. Please try again later.',
          messageAr: serverMessage || 'خطأ في السيرفر. حاول مرة أخرى لاحقاً.',
          retryable: false,
        };
      }
      return {
        type: ERROR_TYPES.UNKNOWN,
        status,
        message: serverMessage || 'An unexpected error occurred.',
        messageAr: serverMessage || 'حدث خطأ غير متوقع.',
        retryable: false,
      };
  }
}

export { ERROR_TYPES };

// ── Request Interceptor: attach JWT + URL safety ────────────────────────────
api.interceptors.request.use(
  (config) => {
    // 1. Attach JWT
    const token = localStorage.getItem('servix_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. URL safety — ensure /api/v1 prefix when using relative paths
    //    Skip if the URL is already absolute (starts with http)
    if (config.url && !config.url.startsWith('http')) {
      const fullUrl = (config.baseURL || '') + config.url;
      if (!fullUrl.includes('/api/v1') && !fullUrl.includes('/api/public')) {
        // If baseURL doesn't contain /api/v1, prepend it to the path
        config.url = `/api/v1${config.url.startsWith('/') ? '' : '/'}${config.url}`;
      }
    }

    // 3. Dev logging
    if (import.meta.env.DEV) {
      console.log(`[API] ➡️ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
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
      console.warn(`[API] ❌ ${status} ${err.config?.url}`, err.message);
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
