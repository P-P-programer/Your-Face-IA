import React, { useState } from 'react';

export default function ConnectDevice({ onConnect }) {
    const [ip, setIp] = useState('');
    const [error, setError] = useState('');

    const handleConnect = () => {
        if (ip.trim() !== '') {
            onConnect(ip);
        } else {
            setError('Ingresa una IP válida');
        }
    };

    return (
        <div className="panel">
            <h2 className="panel-title">Enlazar dispositivo ESP32-CAM</h2>
            <div className="form">
                <input
                    className="input"
                    type="text"
                    placeholder="IP del dispositivo"
                    value={ip}
                    onChange={e => {
                        setIp(e.target.value);
                        setError('');
                    }}
                />
                <button className="button" onClick={handleConnect}>
                    Conectar
                </button>
                {error && <span className="error">{error}</span>}
            </div>
        </div>
    );
}

