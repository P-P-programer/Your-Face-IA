import React, { useEffect, useState } from 'react';
import { getAuthHeader, clearSession } from '../lib/session';

export default function AdminConnections() {
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadConnections();
    }, []);

    const loadConnections = async () => {
        try {
            setLoading(true);
            setError('');
            
            const authHeader = getAuthHeader();
            if (!authHeader) {
                setError('No autenticado.');
                return;
            }

            const res = await fetch('/api/connections/all', {
                headers: {
                    Authorization: authHeader,
                    Accept: 'application/json',
                },
            });

            if (res.status === 401) {
                clearSession();
                window.location.href = '/login?reason=expired';
                return;
            }

            if (res.status === 403) {
                setError('No autorizado para auditoría admin.');
                setConnections([]);
                return;
            }

            const json = await res.json();
            const rows = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
            setConnections(rows);
        } catch (err) {
            setError('Error cargando conexiones.');
            setConnections([]);
        } finally {
            setLoading(false);
        }
    };

    const disconnectDevice = async (connectionId) => {
        if (!confirm('¿Desconectar este dispositivo?')) return;

        try {
            const res = await fetch(`/api/connections/${connectionId}/disconnect`, {
                method: 'POST',
                headers: { Authorization: getAuthHeader() },
            });
            
            if (res.ok) {
                loadConnections();
            }
        } catch (err) {
            console.error('Error:', err);
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="panel">
            <h2 className="panel-title">Auditoría de Conexiones</h2>
            
            {error && <p className="text-red-500">{error}</p>}
            {connections.length === 0 ? (
                <p>No hay conexiones</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #10b981' }}>
                                <th style={{ textAlign: 'left', padding: 8 }}>Usuario</th>
                                <th style={{ textAlign: 'left', padding: 8 }}>Dispositivo</th>
                                <th style={{ textAlign: 'left', padding: 8 }}>IP</th>
                                <th style={{ textAlign: 'left', padding: 8 }}>Conectado</th>
                                <th style={{ textAlign: 'left', padding: 8 }}>Estado</th>
                                <th style={{ textAlign: 'left', padding: 8 }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {connections.map(conn => (
                                <tr key={conn.id} style={{ borderBottom: '1px solid #1e293b' }}>
                                    <td style={{ padding: 8 }}>{conn.user?.name}</td>
                                    <td style={{ padding: 8 }}>{conn.device_name}</td>
                                    <td style={{ padding: 8 }}>{conn.device_ip}</td>
                                    <td style={{ padding: 8 }}>
                                        {new Date(conn.connected_at).toLocaleString()}
                                    </td>
                                    <td style={{ padding: 8 }}>
                                        <span style={{
                                            background: conn.status === 'active' ? '#10b981' : '#64748b',
                                            padding: '4px 8px',
                                            borderRadius: 4,
                                            fontSize: 11,
                                        }}>
                                            {conn.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: 8 }}>
                                        {conn.status === 'active' && (
                                            <button
                                                className="button"
                                                onClick={() => disconnectDevice(conn.id)}
                                                style={{ padding: '4px 8px', fontSize: 11 }}
                                            >
                                                Desconectar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}