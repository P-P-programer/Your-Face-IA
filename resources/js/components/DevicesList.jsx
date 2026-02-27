import React, { useEffect, useState } from 'react';

export default function DevicesList({ user }) {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('auth_token');

    useEffect(() => {
        fetchDevices();
        // Recargar cada 10 segundos para ver estado en tiempo real
        const interval = setInterval(fetchDevices, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchDevices = async () => {
        try {
            const res = await fetch('/api/devices', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setDevices(data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const isOnline = (lastHeartbeat) => {
        if (!lastHeartbeat) return false;
        const lastTime = new Date(lastHeartbeat).getTime();
        const now = new Date().getTime();
        const diffSeconds = (now - lastTime) / 1000;
        return diffSeconds < 60; // Considerar online si heartbeat en últimos 60s
    };

    if (loading) return <div>Cargando dispositivos...</div>;

    return (
        <div className="panel">
            <h2 className="panel-title">📱 Mis dispositivos ESP32</h2>

            {devices.length === 0 ? (
                <p style={{ color: '#9ca3af' }}>
                    No tienes dispositivos registrados
                </p>
            ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                    {devices.map(device => {
                        const online = isOnline(device.last_heartbeat);
                        return (
                            <div
                                key={device.id}
                                style={{
                                    background: online ? '#0f2818' : '#1f1f2e',
                                    border: `1px solid ${online ? '#10b981' : '#4b5563'}`,
                                    borderRadius: 10,
                                    padding: 12,
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 20 }}>
                                            {online ? '🟢' : '🔴'}
                                        </span>
                                        <div>
                                            <p style={{ margin: '0 0 4px', fontWeight: 600 }}>
                                                {device.device_name}
                                            </p>
                                            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>
                                                {device.model} • {device.device_mac}
                                            </p>
                                        </div>
                                    </div>
                                    <span style={{
                                        background: online ? '#10b981' : '#64748b',
                                        color: '#fff',
                                        padding: '4px 8px',
                                        borderRadius: 4,
                                        fontSize: 11,
                                        fontWeight: 600,
                                    }}>
                                        {online ? 'ONLINE' : 'OFFLINE'}
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
                                    <div>
                                        <span style={{ color: '#9ca3af' }}>IP</span>
                                        <p style={{ margin: '4px 0 0', fontFamily: 'monospace' }}>
                                            {device.device_ip}
                                        </p>
                                    </div>
                                    <div>
                                        <span style={{ color: '#9ca3af' }}>Signal</span>
                                        <p style={{ margin: '4px 0 0', fontWeight: 600 }}>
                                            {device.signal_strength} dBm
                                        </p>
                                    </div>
                                    <div>
                                        <span style={{ color: '#9ca3af' }}>Conectado</span>
                                        <p style={{ margin: '4px 0 0', fontSize: 11 }}>
                                            {new Date(device.connected_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <span style={{ color: '#9ca3af' }}>Heartbeat</span>
                                        <p style={{ margin: '4px 0 0', fontSize: 11 }}>
                                            {device.last_heartbeat ? new Date(device.last_heartbeat).toLocaleTimeString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}