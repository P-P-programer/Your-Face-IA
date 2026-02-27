import React, { useEffect, useState } from 'react';

export default function AdminConnections() {
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('auth_token');

    useEffect(() => {
        fetchAllConnections();
    }, []);

    const fetchAllConnections = async () => {
        try {
            const res = await fetch('/api/connections/all', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setConnections(data.data || data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const disconnectDevice = async (connectionId) => {
        if (!confirm('¿Desconectar este dispositivo?')) return;

        try {
            const res = await fetch(`/api/connections/${connectionId}/disconnect`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (res.ok) {
                fetchAllConnections();
            }
        } catch (err) {
            console.error('Error:', err);
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="panel">
            <h2 className="panel-title"> Auditoría de Conexiones</h2>
            
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