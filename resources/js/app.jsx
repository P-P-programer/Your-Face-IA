import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ConnectDevice from './components/ConnectDevice';
import Dashboard from './components/Dashboard';
import AuthPage from './components/AuthPage';
import VerifyEmailPage from './components/VerifyEmailPage';
import ConnectionsList from './components/ConnectionsList';
import AdminConnections from './components/AdminConnections';
import DevicesList from './components/DevicesList';
import './bootstrap';
import '../css/app.css';
import RequestEsp32TokenPage from "./pages/user/RequestEsp32TokenPage";
import AdminTokenRequestsPage from "./pages/admin/AdminTokenRequestsPage";
import AdminRevocationRequestsPage from "./pages/admin/AdminRevocationRequestsPage";
import RequireRole from "./components/guards/RequireRole";
import ForbiddenPage from "./pages/ForbiddenPage";
import { clearSession, getAuthHeader, getToken, getUser, saveSession } from './lib/session';

function App() {
    const [deviceIp, setDeviceIp] = useState('');
    const [token, setToken] = useState(() => {
        const t = localStorage.getItem('token');
        console.log('🔑 [INIT] Token desde localStorage:', t ? t.substring(0, 20) + '...' : 'null');
        return t;
    });
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem('user');
        const u = raw ? JSON.parse(raw) : null;
        console.log('👤 [INIT] User desde localStorage:', u?.email || 'null', '| Role:', u?.role || 'null');
        return u;
    });
    const [tokenType, setTokenType] = useState(() => {
        const tt = localStorage.getItem('token_type') || 'Bearer';
        console.log('🎫 [INIT] Token type:', tt);
        return tt;
    });
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            if (!token) {
                setChecking(false);
                return;
            }
            try {
                const res = await fetch('/api/me', {
                    headers: { Authorization: getAuthHeader() },
                });
                if (!res.ok) throw new Error();
                const data = await res.json();
                setUser(data);
            } catch {
                clearSession();
                setToken(null);
                setUser(null);
            } finally {
                setChecking(false);
            }
        };
        checkSession();
    }, [token]);

    // Auto logout por inactividad (temporalmente desactivado para diagnóstico)
    // useEffect(() => {
    //   if (!token) return;
    //   const TIMEOUT_MS = 30 * 60 * 1000;
    //   let timer = null;
    //
    //   const reset = () => {
    //     clearTimeout(timer);
    //     timer = setTimeout(() => {
    //       handleLogout(true);
    //     }, TIMEOUT_MS);
    //   };
    //
    //   ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach((evt) =>
    //     window.addEventListener(evt, reset)
    //   );
    //   reset();
    //
    //   return () => {
    //     clearTimeout(timer);
    //     ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach((evt) =>
    //       window.removeEventListener(evt, reset)
    //     );
    //   };
    // }, [token]);

    const handleAuth = (newToken, newUser, newTokenType = 'Bearer') => {
        console.log('📥 [handleAuth] Recibiendo:', { 
            token: newToken?.substring(0, 20) + '...', 
            user: newUser?.email, 
            role: newUser?.role 
        });

        setToken(newToken);
        setUser(newUser);
        setTokenType(newTokenType);

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('token_type', newTokenType);

        console.log('💾 [handleAuth] Guardado en localStorage');

        // Configurar axios con el nuevo token
        window.axios.defaults.headers.common['Authorization'] = `${newTokenType} ${newToken}`;

        console.log('🔧 [handleAuth] Axios configurado con nuevo token');
    };

    const handleLogout = async (expired = false) => {
        try {
            if (getToken()) {
                await fetch('/api/logout', {
                    method: 'POST',
                    headers: { Authorization: getAuthHeader() },
                });
            }
        } catch {}

        clearSession();
        setToken(null);
        setUser(null);
        setDeviceIp('');

        // Fuerza limpieza de React Router + redirección dura
        window.history.replaceState(null, '', '/login');

        if (expired) {
            window.location.href = '/login?reason=inactive';
        } else {
            window.location.href = '/login';
        }
    };

    if (checking) {
        return <div className="container">Cargando...</div>;
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/verify-email/:id/:hash" element={<VerifyEmailPage />} />
                
                {token && user ? (
                    <Route
                        path="/*"
                        element={
                            <Layout
                                deviceIp={deviceIp}
                                onConnect={setDeviceIp}
                                onDisconnect={() => setDeviceIp('')}
                                onLogout={handleLogout}
                                user={user}
                            >
                                <Routes>
                                    <Route path="/" element={
                                        !deviceIp ? (
                                            <ConnectDevice onConnect={setDeviceIp} />
                                        ) : (
                                            <Dashboard deviceIp={deviceIp} />
                                        )
                                    } />
                                    <Route path="/connections" element={<ConnectionsList user={user} />} />
                                    <Route path="/devices" element={<DevicesList user={user} />} />
                                    {user.role === 'super_admin' && (
                                        <Route path="/admin/connections" element={<AdminConnections />} />
                                    )}
                                    <Route path="/tokens/request" element={<RequestEsp32TokenPage />} />
                                    <Route path="/admin/token-requests" element={<AdminTokenRequestsPage />} />
                                    <Route path="/admin/revocation-requests" element={<AdminRevocationRequestsPage />} />
                                </Routes>
                            </Layout>
                        }
                    />
                ) : (
                    <Route path="/*" element={<AuthPage onAuth={handleAuth} />} />
                )}
                <Route path="/login" element={<AuthPage onAuth={handleAuth} />} />
                <Route path="/403" element={<ForbiddenPage />} />
            </Routes>
        </BrowserRouter>
    );
}

const root = createRoot(document.getElementById('app'));
root.render(<App />);

//  Registrar Service Worker para PWA
const PWA_ENABLED = String(import.meta.env.VITE_ENABLE_PWA || 'false') === 'true';
const APP_ENV = import.meta.env.VITE_APP_ENV || import.meta.env.MODE; // local | production
const IS_PROD = import.meta.env.PROD;

console.info(`[APP] env=${APP_ENV} | mode=${import.meta.env.MODE} | prod=${IS_PROD}`);
console.info(`[PWA] enabled=${PWA_ENABLED}`);

if (PWA_ENABLED && IS_PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.info(`[PWA] Service Worker registrado en: ${reg.scope}`);
    } catch (e) {
      console.error('[PWA] Error registrando Service Worker:', e);
    }
  });
} else {
  console.warn(
    `[PWA] Desactivado. Motivo -> enabled=${PWA_ENABLED}, prod=${IS_PROD}. ` +
    `Si fue accidental, revisa VITE_ENABLE_PWA y VITE_APP_ENV.`
  );
}

