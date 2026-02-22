import React, { useState, useEffect } from 'react';
import { IconSettings, IconChangeIp, IconDisconnect, IconStatus, IconMenu } from './Icons';

export default function Layout({ children, deviceIp, onConnect, onDisconnect }) {
    const [showIpModal, setShowIpModal] = useState(false);
    const [tempIp, setTempIp] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [dialog, setDialog] = useState(null);
    const [error, setError] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const showConfirmation = (title, message, onConfirm) => {
        setDialog({ title, message, onConfirm });
    };

    const confirmAction = () => {
        if (dialog?.onConfirm) {
            dialog.onConfirm();
        }
        setDialog(null);
    };

    const openIpModal = () => {
        setTempIp(deviceIp);
        setShowIpModal(true);
        setIsSidebarOpen(false);
    };

    const saveIp = () => {
        if (!tempIp.trim()) {
            setError('La IP no puede estar vacía');
            return;
        }
        showConfirmation(
            'Cambiar IP',
            `¿Cambiar a ${tempIp}?`,
            () => {
                onConnect(tempIp.trim());
                setShowIpModal(false);
                setError('');
            }
        );
    };

    const disconnect = () => {
        showConfirmation(
            'Desconectar',
            '¿Desconectar del dispositivo?',
            () => {
                onDisconnect();
                setIsSidebarOpen(false);
            }
        );
    };

    const openSettings = () => {
        showConfirmation(
            'Ajustes',
            'Función en desarrollo',
            () => {
                setIsSidebarOpen(false);
            }
        );
    };

    const hasSidebarContent = deviceIp || true;

    return (
        <div className="app-shell">
            {hasSidebarContent && (
                <>
                    <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`} tabIndex={0}>
                        <div className="sidebar-inner">
                            <nav className="nav">
                                {deviceIp && (
                                    <div className="nav-item" onClick={openIpModal}>
                                        <IconChangeIp />
                                        <span className="nav-text">Cambiar IP</span>
                                    </div>
                                )}
                                <div className="nav-item" onClick={openSettings}>
                                    <IconSettings />
                                    <span className="nav-text">Ajustes</span>
                                </div>
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
                            </div>
                        </div>

                        
                        
                    </aside>

                    {isSidebarOpen && (
                        <div
                            className="sidebar-overlay"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}
                </>
            )}

            <div className="content">
                <header className="header">
                    <div className="header-brand">
                        <span className="brand-dot" />
                        <span>Your Face IA</span>
                    </div>

                    <div className="header-actions">
                        {hasSidebarContent && isMobile && (
                            <button
                                className="mobile-menu-btn"
                                onClick={() => setIsSidebarOpen(s => !s)}
                                aria-label="Abrir menú"
                            >
                                <IconMenu />
                            </button>
                        )}

                        <span className="status-pill">
                            <span className="status-dot" />
                            {deviceIp ? `Conectado: ${deviceIp}` : 'Desconectado'}
                        </span>
                    </div>
                </header>

                <main className="container">
                    {children}
                </main>
            </div>

            {/* Modal Cambiar IP */}
            {showIpModal && (
                <div className="modal-backdrop" onClick={() => setShowIpModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ margin: 0 }}>Cambiar IP</h3>
                            <button className="button" onClick={() => setShowIpModal(false)}>
                                Cerrar
                            </button>
                        </div>
                        <div className="form">
                            <input
                                className="input"
                                type="text"
                                placeholder="Nueva IP"
                                value={tempIp}
                                onChange={e => {
                                    setTempIp(e.target.value);
                                    setError('');
                                }}
                            />
                            {error && <span className="error">{error}</span>}
                            <button className="button" onClick={saveIp}>
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Confirmación */}
            {dialog && (
                <div className="modal-backdrop" onClick={() => setDialog(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ margin: 0 }}>{dialog.title}</h3>
                        </div>
                        <p style={{ margin: '12px 0', color: 'var(--text)' }}>
                            {dialog.message}
                        </p>
                        <div className="form" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <button className="button" onClick={() => setDialog(null)}>
                                Cancelar
                            </button>
                            <button
                                className="button"
                                style={{ background: '#10b981' }}
                                onClick={confirmAction}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}