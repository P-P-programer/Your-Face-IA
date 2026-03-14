import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function TokenConnectionsList({ connections = [], onDisconnect, onRevokeRequest }) {
    const location = useLocation();
    const [showRevoked, setShowRevoked] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('view') === 'revoked') setShowRevoked(true);
    }, [location.search]);

    const { activeConnections, revokedConnections } = useMemo(() => {
        const active = [];
        const revoked = [];

        for (const c of connections) {
            const isRevoked =
                c.status === 'revoked' ||
                c.token_status === 'revoked' ||
                !!c.revoked_at;

            if (isRevoked) revoked.push(c);
            else active.push(c);
        }

        return { activeConnections: active, revokedConnections: revoked };
    }, [connections]);

    return (
        <div style={{ display: 'grid', gap: 12 }}>
            <section>
                <h3>🟢 Dispositivos activos ({activeConnections.length})</h3>
                {activeConnections.length === 0 ? (
                    <p style={{ color: '#94a3b8' }}>No hay dispositivos activos.</p>
                ) : (
                    activeConnections.map((conn) => (
                        <div key={conn.id} style={{ padding: 12, border: '1px solid #1e293b', borderRadius: 8 }}>
                            <strong>{conn.device_name || `Dispositivo #${conn.id}`}</strong>
                            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                                <button type="button" onClick={() => onDisconnect?.(conn.id)}>Desconectar</button>
                                <button type="button" onClick={() => onRevokeRequest?.(conn.id)}>Solicitar revocación</button>
                            </div>
                        </div>
                    ))
                )}
            </section>

            <section>
                <button type="button" onClick={() => setShowRevoked((v) => !v)}>
                    {showRevoked ? 'Ocultar' : 'Mostrar'} revocados ({revokedConnections.length})
                </button>

                {showRevoked && (
                    <div style={{ marginTop: 10 }}>
                        <h3>🔴 Revocados</h3>
                        {revokedConnections.length === 0 ? (
                            <p style={{ color: '#94a3b8' }}>No hay dispositivos revocados.</p>
                        ) : (
                            revokedConnections.map((conn) => (
                                <div key={conn.id} style={{ padding: 12, border: '1px solid #7f1d1d', borderRadius: 8 }}>
                                    <strong>{conn.device_name || `Dispositivo #${conn.id}`}</strong>
                                    <p style={{ margin: '6px 0 0', color: '#fca5a5' }}>Estado: Revocado</p>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}