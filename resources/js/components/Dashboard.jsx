import React, { useEffect, useMemo, useState } from 'react';
import { getAuthHeader } from '../lib/session';

export default function Dashboard() {
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);
    const [detections, setDetections] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const selectedDevice = useMemo(
        () => devices.find((d) => d.id === selectedDeviceId) || null,
        [devices, selectedDeviceId]
    );

    const isOnline = useMemo(() => {
        if (!selectedDevice?.last_heartbeat) return false;
        const last = new Date(selectedDevice.last_heartbeat).getTime();
        return (Date.now() - last) / 1000 < 60;
    }, [selectedDevice]);

    const loadDevices = async () => {
        const res = await fetch('/api/devices', {
            headers: {
                Authorization: getAuthHeader(),
                Accept: 'application/json',
            },
        });

        if (!res.ok) {
            throw new Error('No se pudieron cargar los dispositivos');
        }

        const json = await res.json();
        const rows = Array.isArray(json) ? json : [];

        setDevices(rows);
        setSelectedDeviceId((prev) => {
            if (prev && rows.some((d) => d.id === prev)) return prev;
            return rows[0]?.id ?? null;
        });
    };

    const loadDetections = async (device) => {
        const params = new URLSearchParams();
        if (device?.device_ip) {
            params.set('device_ip', device.device_ip);
        }

        const query = params.toString();
        const url = query ? `/api/detections/recent?${query}` : '/api/detections/recent';

        const res = await fetch(url, {
            headers: {
                Authorization: getAuthHeader(),
                Accept: 'application/json',
            },
        });

        if (!res.ok) {
            throw new Error('No se pudieron cargar las detecciones');
        }

        const data = await res.json();
        setDetections(Array.isArray(data?.detections) ? data.detections : []);
        setStats(data?.stats ?? null);
    };

    const refresh = async () => {
        try {
            setError('');
            await loadDevices();
        } catch (e) {
            setError('No se pudieron cargar los datos del dashboard.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!selectedDevice) {
            setDetections([]);
            setStats(null);
            return;
        }

        loadDetections(selectedDevice).catch(() => {
            setError('No se pudieron cargar las detecciones del dispositivo seleccionado.');
        });
    }, [selectedDeviceId, devices.length]);

    const latestDetection = detections[0] ?? null;

    if (loading) {
        return <div className="panel">Cargando dashboard de cámara...</div>;
    }

    return (
        <div className="main-grid">
            <section className="panel">
                <h2 className="panel-title">Vista de cámara</h2>

                {devices.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                        <label className="input-label" htmlFor="device-select">Dispositivo</label>
                        <select
                            id="device-select"
                            className="input"
                            value={selectedDeviceId ?? ''}
                            onChange={(e) => setSelectedDeviceId(Number(e.target.value))}
                        >
                            {devices.map((device) => (
                                <option key={device.id} value={device.id}>
                                    {device.device_name} ({device.device_ip})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="capture" style={{ minHeight: 260, display: 'grid', placeItems: 'center' }}>
                    {latestDetection?.image_path ? (
                        <img
                            src={latestDetection.image_path}
                            alt="Última captura detectada"
                            style={{ width: '100%', borderRadius: 12 }}
                        />
                    ) : (
                        <div style={{ color: '#94a3b8', textAlign: 'center' }}>
                            Aún no hay captura reciente para este dispositivo.
                        </div>
                    )}
                </div>

                {error && <p className="error" style={{ marginTop: 12 }}>{error}</p>}
            </section>

            <aside className="cards">
                <div className="card">
                    <div className="card-label">Dispositivo</div>
                    <div className="card-value">{selectedDevice?.device_name ?? 'Sin dispositivos'}</div>
                </div>
                <div className="card">
                    <div className="card-label">Estado</div>
                    <div className="card-value">{isOnline ? 'Online' : 'Offline'}</div>
                </div>
                <div className="card">
                    <div className="card-label">Detecciones hoy</div>
                    <div className="card-value">{stats?.total_today ?? 0}</div>
                </div>
                <div className="card">
                    <div className="card-label">Última actividad</div>
                    <div className="card-value">
                        {selectedDevice?.last_heartbeat
                            ? new Date(selectedDevice.last_heartbeat).toLocaleString()
                            : 'N/A'}
                    </div>
                </div>
            </aside>
        </div>
    );
}