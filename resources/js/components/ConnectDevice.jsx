import React from 'react';

export default function ConnectDevice() {
    return (
        <div className="panel">
            <h2 className="panel-title">Conexión automática</h2>
            <p>
                La vinculación por IP manual fue retirada. Ahora los dispositivos ESP32 se conectan
                mediante token aprobado y aparecen automáticamente en el dashboard.
            </p>
        </div>
    );
}

