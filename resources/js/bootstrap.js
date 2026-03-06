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
    console.log('[REQ]', config.method?.toUpperCase(), config.url, '| Auth:', authHeader.substring(0, 20) + '...');
  } else {
    console.log('[REQ]', config.method?.toUpperCase(), config.url, '| Sin Auth');
  }
  return config;
});

window.axios.interceptors.response.use(
  (response) => {
    console.log('[RES OK]', response.config.method?.toUpperCase(), response.config.url, '| Status:', response.status);
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '(sin-url)';
    const method = error?.config?.method?.toUpperCase() || 'GET';
    const hasToken = !!getToken();

    console.error('[RES ERR]', method, url, '| Status:', status, '| hasToken:', hasToken);

    if (status === 401) {
      console.warn('🚨 [401 DETECTED] Limpiando sesión y redirigiendo...');
      
      // Solo forzar logout si realmente había sesión y no estamos en login
      if (hasToken && window.location.pathname !== '/login') {
        clearSession();
        window.location.href = '/login?reason=expired';
      }
    }

    return Promise.reject(error);
  }
);
