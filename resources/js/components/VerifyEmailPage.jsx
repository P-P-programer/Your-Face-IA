import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function VerifyEmailPage() {
    const { id, hash } = useParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState('Verificando correo...');
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await fetch(
                    `/api/verify-email/${id}/${hash}${window.location.search}`
                );
                const data = await res.json();

                if (!res.ok) {
                    setMessage(data.message || 'Error en verificación');
                    setSuccess(false);
                    return;
                }

                setMessage(`✅ Correo verificado. ${data.user.email} ya puede iniciar sesión.`);
                setSuccess(true);
            } catch (err) {
                setMessage('Error de red');
                setSuccess(false);
            }
        };

        verify();
    }, [id, hash]);

    return (
        <div className="panel" style={{ maxWidth: 420, margin: '40px auto', textAlign: 'center' }}>
            <h2 className="panel-title">Verificación de Correo</h2>
            <p style={{ color: success ? '#34d399' : '#ef4444' }}>
                {message}
            </p>
            {success && (
                <button
                    className="button"
                    onClick={() => navigate('/login')}
                    style={{ background: '#10b981' }}
                >
                    Ir al Login
                </button>
            )}
        </div>
    );
}