import axios from 'axios';
import { clearSession, getAuthHeader, getToken } from './lib/session';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.headers.common['Accept'] = 'application/json';

window.axios.interceptors.request.use((config) => {
  const authHeader = getAuthHeader();
  if (authHeader) {
    config.headers = config.headers || {};
    config.headers.Authorization = authHeader;
  }
  return config;
});

window.axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '(sin-url)';
    const hasToken = !!getToken();

    if (status === 401) {
      console.warn('[401]', { url, hasToken, path: window.location.pathname });

      // Solo forzar logout si realmente había sesión
      if (hasToken && window.location.pathname !== '/login') {
        clearSession();
        window.location.href = '/login?reason=expired';
      }
    }

    return Promise.reject(error);
  }
);
