import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VerifyEmailPage() {
    const navigate = useNavigate();
    const [message, setMessage] = useState('Procesando verificación...');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const verified = params.get('verified');
        const reason = params.get('reason');

        if (verified === '1') {
            setMessage('Correo verificado correctamente. Ya puedes iniciar sesión.');
            setSuccess(true);
            return;
        }

        if (verified === '0') {
            if (reason === 'invalid_signature') {
                setMessage('Enlace inválido o expirado (firma no válida).');
            } else if (reason === 'invalid_hash') {
                setMessage('Enlace inválido (hash no coincide).');
            } else {
                setMessage('No se pudo verificar el correo.');
            }
            setSuccess(false);
            return;
        }

        setMessage('Abre el enlace de verificación desde tu correo.');
        setSuccess(false);
    }, []);

    return (
        <div className="panel" style={{ maxWidth: 420, margin: '40px auto', textAlign: 'center' }}>
            <h2 className="panel-title">Verificación de Correo</h2>
            <p style={{ color: success ? '#34d399' : '#ef4444' }}>{message}</p>

            <button
                className="button"
                onClick={() => navigate('/login')}
                style={{ background: '#10b981', marginTop: 12 }}
            >
                Ir al Login
            </button>
        </div>
    );
}