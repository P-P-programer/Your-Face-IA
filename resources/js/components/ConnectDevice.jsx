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
                <label htmlFor="ip-input" className="input-label">
                    IP del dispositivo
                </label>
                <input
                    id="ip-input"
                    className="input"
                    type="text"
                    placeholder="192.168.1.100"
                    value={ip}
                    onChange={e => {
                        setIp(e.target.value);
                        setError('');
                    }}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? 'ip-error' : undefined}
                />
                <button className="button" onClick={handleConnect}>
                    Conectar
                </button>
                {error && (
                    <span id="ip-error" className="error" role="alert">
                        {error}
                    </span>
                )}
            </div>
        </div>
    );
}

