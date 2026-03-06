import axios from 'axios';
import { clearSession, getAuthHeader } from './lib/session';
// Configuración global de Axios para incluir token de autenticación y manejar expiración
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const authHeader = getAuthHeader();
if (authHeader) {
  window.axios.defaults.headers.common['Authorization'] = authHeader;
  window.axios.defaults.headers.common['Accept'] = 'application/json';
}

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
