import React from 'react';

export default function Dashboard({ deviceIp }) {
    const fakeData = {
        status: 'Conectado',
        lastImage: 'https://placekitten.com/640/360',
        detections: 5,
        lastSeen: 'Hace 2 min',
    };

    return (
        <div className="main-grid">
            <section className="panel">
                <h2 className="panel-title">Vista principal</h2>
                <div className="capture">
                    <img
                        src={fakeData.lastImage}
                        alt="Última captura"
                        style={{ width: '100%', borderRadius: 12 }}
                    />
                </div>
            </section>

            <aside className="cards">
                <div className="card">
                    <div className="card-label">Dispositivo</div>
                    <div className="card-value">{deviceIp}</div>
                </div>
                <div className="card">
                    <div className="card-label">Estado</div>
                    <div className="card-value">{fakeData.status}</div>
                </div>
                <div className="card">
                    <div className="card-label">Detecciones hoy</div>
                    <div className="card-value">{fakeData.detections}</div>
                </div>
                <div className="card">
                    <div className="card-label">Última actividad</div>
                    <div className="card-value">{fakeData.lastSeen}</div>
                </div>
            </aside>
        </div>
    );
}