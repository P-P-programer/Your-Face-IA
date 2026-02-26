import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ConnectDevice from './components/ConnectDevice';
import Dashboard from './components/Dashboard';
import AuthPage from './components/AuthPage';
import VerifyEmailPage from './components/VerifyEmailPage';
import './bootstrap';
import '../css/app.css';

function App() {
    const [deviceIp, setDeviceIp] = useState('');
    const [token, setToken] = useState(localStorage.getItem('auth_token'));
    const [user, setUser] = useState(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            if (!token) {
                setChecking(false);
                return;
            }
            try {
                const res = await fetch('/api/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error();
                const data = await res.json();
                setUser(data);
            } catch {
                localStorage.removeItem('auth_token');
                setToken(null);
                setUser(null);
            } finally {
                setChecking(false);
            }
        };
        checkSession();
    }, [token]);

    const handleAuth = (newToken, userData) => {
        localStorage.setItem('auth_token', newToken);
        setToken(newToken);
        setUser(userData);
    };

    const handleLogout = async () => {
        if (!token) return;
        await fetch('/api/logout', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
        setDeviceIp('');
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
                                </Routes>
                            </Layout>
                        }
                    />
                ) : (
                    <Route path="/*" element={<AuthPage onAuth={handleAuth} />} />
                )}
            </Routes>
        </BrowserRouter>
    );
}

const root = createRoot(document.getElementById('app'));
root.render(<App />);

