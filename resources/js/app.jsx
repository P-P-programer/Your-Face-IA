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
import TokenRevocationsPage from "./pages/user/TokenRevocationsPage";
import RequireRole from "./components/guards/RequireRole";
import ForbiddenPage from "./pages/ForbiddenPage";
import { clearSession, getAuthHeader, getToken, getUser, saveSession } from './lib/session';

function App() {
    const [deviceIp, setDeviceIp] = useState('');
    const [token, setToken] = useState(() => getToken());
    const [user, setUser] = useState(() => getUser());
    const [tokenType, setTokenType] = useState(() => localStorage.getItem('token_type') || 'Bearer');
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        console.log('🔄 [useEffect] token cambió:', token ? token.substring(0, 20) + '...' : 'null');
        if (token) {
            window.axios.defaults.headers.common['Authorization'] = `${tokenType} ${token}`;
            console.log('✅ [useEffect] Axios configurado');
        } else {
            delete window.axios.defaults.headers.common['Authorization'];
            console.log('❌ [useEffect] Axios sin auth');
        }
    }, [token, tokenType]);

    const checkSession = async () => {
        console.log('🔍 [checkSession] Iniciando... token:', token ? 'existe' : 'null');
        if (!token) {
            setChecking(false);
            return;
        }
        try {
            console.log('📡 [checkSession] Llamando /api/me...');
            const res = await fetch('/api/me', {
                headers: { Authorization: getAuthHeader() },
            });
            console.log('📡 [checkSession] Respuesta /api/me:', res.status);
            if (!res.ok) throw new Error();
            const data = await res.json();
            console.log('✅ [checkSession] Usuario válido:', data.email);
            setUser(data);
        } catch (err) {
            console.error('❌ [checkSession] Error:', err.message);
            clearSession();
            setToken(null);
            setUser(null);
        } finally {
            setChecking(false);
        }
    };

    useEffect(() => {
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
        saveSession({
            access_token: newToken,
            token_type: newTokenType,
            user: newUser,
        });

        setToken(getToken());
        setUser(getUser());
        setTokenType(newTokenType);

        window.axios.defaults.headers.common['Authorization'] = `${newTokenType} ${newToken}`;
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

                                    <Route path="/tokens/request" element={<RequestEsp32TokenPage />} />
                                    <Route path="/tokens/revocations" element={<TokenRevocationsPage />} />

                                    {/* Admin */}
                                    <Route element={<RequireRole roles={['super_admin']} />}>
                                        <Route path="/admin/connections" element={<AdminConnections />} />
                                        <Route path="/admin/token-requests" element={<AdminTokenRequestsPage />} />
                                        <Route path="/admin/revocation-requests" element={<AdminRevocationRequestsPage />} />
                                    </Route>
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

// Registrar Service Worker para PWA
const PWA_ENABLED = String(import.meta.env.VITE_ENABLE_PWA || 'false') === 'true';
const APP_ENV = import.meta.env.VITE_APP_ENV || import.meta.env.MODE;
const IS_PROD = import.meta.env.PROD;
const SW_VERSION = String(import.meta.env.VITE_SW_VERSION || 'dev');

console.info(`[APP] env=${APP_ENV} | mode=${import.meta.env.MODE} | prod=${IS_PROD}`);
console.info(`[PWA] enabled=${PWA_ENABLED} | swVersion=${SW_VERSION}`);

if (PWA_ENABLED && IS_PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const reg = await navigator.serviceWorker.register(`/sw.js?v=${encodeURIComponent(SW_VERSION)}`);
            console.info(`[PWA] SW registrado en: ${reg.scope}`);

            await reg.update();

            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                if (!newWorker) return;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && reg.waiting) {
                        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                    }
                });
            });

            navigator.serviceWorker.addEventListener('controllerchange', () => {
                const flag = `sw-reloaded-${SW_VERSION}`;
                if (!sessionStorage.getItem(flag)) {
                    sessionStorage.setItem(flag, '1');
                    window.location.reload();
                }
            });
        } catch (e) {
            console.error('[PWA] Error registrando SW:', e);
        }
    });
} else {
    console.warn(`[PWA] Desactivado. Motivo -> enabled=${PWA_ENABLED}, prod=${IS_PROD}`);
}

