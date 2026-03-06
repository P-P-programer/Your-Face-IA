export const TOKEN_KEY = "token";
export const LEGACY_TOKEN_KEY = "auth_token";
export const USER_KEY = "user";
export const TOKEN_TYPE_KEY = "token_type";
// Funciones para manejar sesión de usuario en localStorage
export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession({ access_token, token_type = "Bearer", user }) {
  localStorage.setItem(TOKEN_KEY, access_token);
  // compatibilidad temporal con clave antigua
  localStorage.setItem(LEGACY_TOKEN_KEY, access_token);
  localStorage.setItem(TOKEN_TYPE_KEY, token_type);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(TOKEN_TYPE_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAuthHeader() {
  const token = getToken();
  const type = localStorage.getItem(TOKEN_TYPE_KEY) || "Bearer";
  return token ? `${type} ${token}` : "";
}