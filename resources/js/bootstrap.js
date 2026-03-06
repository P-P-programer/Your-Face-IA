import axios from 'axios';
import { clearSession, getAuthHeader } from './lib/session';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.headers.common['Accept'] = 'application/json';

// Configuración global de Axios para incluir token de autenticación y manejar expiración
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
    if (error?.response?.status === 401) {
      clearSession();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?reason=expired';
      }
    }
    return Promise.reject(error);
  }
);
