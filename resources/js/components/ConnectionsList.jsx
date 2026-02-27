import React, { useEffect, useState } from 'react';

export default function ConnectionsList({ user }) {
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const token = localStorage.getItem('auth_token');

    useEffect(() => {
        fetchConnections();
    }, []);

    const fetchConnections = async () => {
        try {
            const res = await fetch('/api/connections', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setConnections(data);
        } catch (err) {
            setError('Error al cargar conexiones');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="panel">
            <h2 className="panel-title">Mi historial de conexiones</h2>
            
            {error && <span className="error">{error}</span>}

            {connections.length === 0 ? (
                <p>No hay conexiones registradas</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #10b981' }}>
                                <th style={{ textAlign: 'left', padding: 8 }}>Dispositivo</th>
                                <th style={{ textAlign: 'left', padding: 8 }}>IP</th>
                                <th style={{ textAlign: 'left', padding: 8 }}>Conectado</th>
                                <th style={{ textAlign: 'left', padding: 8 }}>Desconectado</th>
                                <th style={{ textAlign: 'left', padding: 8 }}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {connections.map(conn => (
                                <tr key={conn.id} style={{ borderBottom: '1px solid #1e293b' }}>
                                    <td style={{ padding: 8 }}>
                                        {conn.device_type === 'mobile' ? '📱' : '💻'} {conn.device_name}
                                    </td>
                                    <td style={{ padding: 8 }}>{conn.device_ip}</td>
                                    <td style={{ padding: 8 }}>
                                        {new Date(conn.connected_at).toLocaleString()}
                                    </td>
                                    <td style={{ padding: 8 }}>
                                        {conn.disconnected_at
                                            ? new Date(conn.disconnected_at).toLocaleString()
                                            : '-'}
                                    </td>
                                    <td style={{ padding: 8 }}>
                                        <span style={{
                                            background: conn.status === 'active' ? '#10b981' : '#64748b',
                                            padding: '4px 8px',
                                            borderRadius: 4,
                                            fontSize: 12,
                                        }}>
                                            {conn.status}
                                        </span>
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