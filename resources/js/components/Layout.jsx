import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    IconSettings, 
    IconChangeIp, 
    IconDisconnect, 
    IconStatus, 
    IconMenu,
    IconHome,
    IconHistory,
    IconShield,
    IconLogout,
    IconLogo
} from './Icons';
import ConfirmDialog from './ConfirmDialog';

export default function Layout({ children, deviceIp, onConnect, onDisconnect, onLogout, user }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(null);
    const location = useLocation();

    const disconnect = () => {
        setConfirmDialog({
            title: 'Desconectar dispositivo',
            message: '¿Estás seguro de desconectar el dispositivo ESP32-CAM?',
            onConfirm: () => {
                onDisconnect();
                setSidebarOpen(false);
                setConfirmDialog(null);
            },
            onCancel: () => setConfirmDialog(null),
        });
    };

    const changeIp = () => {
        setConfirmDialog({
            title: 'Cambiar IP',
            message: '¿Cambiar la IP del dispositivo ESP32-CAM?',
            onConfirm: () => {
                onConnect('');
                setSidebarOpen(false);
                setConfirmDialog(null);
            },
            onCancel: () => setConfirmDialog(null),
        });
    };

    const logout = () => {
        setConfirmDialog({
            title: 'Cerrar sesión',
            message: '¿Estás seguro de cerrar tu sesión?',
            onConfirm: () => {
                onLogout();
                setSidebarOpen(false);
                setConfirmDialog(null);
            },
            onCancel: () => setConfirmDialog(null),
        });
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="app-shell">
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <button
                className="mobile-menu-button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle menu"
                style={{ opacity: sidebarOpen ? 0 : 1, pointerEvents: sidebarOpen ? 'none' : 'auto' }}
            >
                <IconMenu />
            </button>

            <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-content">
                    <div className="logo">
                        <IconLogo />
                        <span className="logo-text">Your Face IA</span>
                    </div>

                    <nav className="nav">
                        <Link 
                            to="/" 
                            className={`nav-item ${isActive('/') ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <IconHome />
                            <span className="nav-text">Inicio</span>
                        </Link>

                        <Link 
                            to="/devices" 
                            className={`nav-item ${isActive('/devices') ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <IconStatus />
                            <span className="nav-text">Mis Dispositivos</span>
                        </Link>

                        <Link 
                            to="/connections" 
                            className={`nav-item ${isActive('/connections') ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <IconHistory />
                            <span className="nav-text">Mi Historial</span>
                        </Link>

                        {user?.role === 'superadmin' && (
                            <Link 
                                to="/admin/connections" 
                                className={`nav-item ${isActive('/admin/connections') ? 'active' : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <IconShield />
                                <span className="nav-text">Auditoría Admin</span>
                            </Link>
                        )}

                        {deviceIp && (
                            <button 
                                className="nav-item" 
                                onClick={changeIp}
                            >
                                <IconChangeIp />
                                <span className="nav-text">Cambiar IP</span>
                            </button>
                        )}

                        <button 
                            className="nav-item" 
                            onClick={() => setSidebarOpen(false)}
                        >
                            <IconSettings />
                            <span className="nav-text">Configuración</span>
                        </button>
                    </nav>

                    <div className="sidebar-bottom">
                        {deviceIp && (
                            <div className="nav-item">
                                <IconStatus />
                                <span className="nav-text">ESP32-CAM • {deviceIp}</span>
                            </div>
                        )}
                        {deviceIp && (
                            <button className="nav-item danger" onClick={disconnect}>
                                <IconDisconnect />
                                <span className="nav-text">Desconectar</span>
                            </button>
                        )}
                        {onLogout && (
                            <button className="nav-item" onClick={logout}>
                                <IconLogout />
                                <span className="nav-text">Cerrar sesión</span>
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <div className="container">
                    {children}
                </div>
            </main>

            {confirmDialog && (
                <ConfirmDialog
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={confirmDialog.onCancel}
                />
            )}
        </div>
    );
}