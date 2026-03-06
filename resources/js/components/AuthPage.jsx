import React, { useState, useEffect } from 'react';

export default function AuthPage({ onAuth }) {
    const [mode, setMode] = useState('login'); // login | register
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifiedMessage, setVerifiedMessage] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const verified = params.get('verified');

        if (verified === '1') {
            setVerifiedMessage('✅ Correo verificado. Ya puedes iniciar sesión.');
        } else if (verified === '0') {
            setVerifiedMessage('❌ Verificación inválida o expirada.');
        }
    }, []);

    const update = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
        setError('');
        setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        const endpoint = mode === 'login' ? '/api/login' : '/api/register';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data?.message || 'Error en la solicitud');
                return;
            }

            // Si es registro exitoso
            if (mode === 'register') {
                setMessage('✅ Cuenta creada. Revisa tu email para verificarla.');
                setForm({ name: '', email: '', password: '' });
                setTimeout(() => setMode('login'), 3000);
                return;
            }

            // Si es login exitoso
            const token = data?.access_token || data?.token;
            const tokenType = data?.token_type || 'Bearer';
            const user = data?.user;

            if (!token || !user) {
                setError('Respuesta de login inválida');
                return;
            }

            console.log('✅ [LOGIN OK] Token:', token.substring(0, 20) + '...', '| User:', user.email, '| Role:', user.role);

            onAuth(token, user, tokenType);

            console.log('🔄 [REDIRECT] Redirigiendo a dashboard...');

            // Redirección forzada después del login
            window.location.href = user.role === 'super_admin'
                ? '/admin/token-requests'
                : '/';
        } catch (err) {
            setError('Error de red');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="panel" style={{ maxWidth: 420, margin: '40px auto' }}>
            <h2 className="panel-title">
                {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </h2>

            <div className="form" style={{ gridAutoFlow: 'column', gap: 8, marginBottom: 16 }}>
                <button
                    className="button"
                    style={{ background: mode === 'login' ? '#10b981' : '#0f172a' }}
                    onClick={() => setMode('login')}
                >
                    Login
                </button>
                <button
                    className="button"
                    style={{ background: mode === 'register' ? '#10b981' : '#0f172a' }}
                    onClick={() => setMode('register')}
                >
                    Registro
                </button>
            </div>

            <form className="form" onSubmit={handleSubmit}>
                {mode === 'register' && (
                    <>
                        <label className="input-label" htmlFor="name">Nombre</label>
                        <input
                            id="name"
                            className="input"
                            type="text"
                            value={form.name}
                            onChange={e => update('name', e.target.value)}
                        />
                    </>
                )}

                <label className="input-label" htmlFor="email">Correo</label>
                <input
                    id="email"
                    className="input"
                    type="email"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                />

                <label className="input-label" htmlFor="password">Contraseña</label>
                <input
                    id="password"
                    className="input"
                    type="password"
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                />

                <button className="button" type="submit" disabled={loading}>
                    {loading ? 'Procesando...' : 'Continuar'}
                </button>

                {error && <span className="error" role="alert">{error}</span>}
                {message && <span style={{ color: '#34d399' }}>{message}</span>}
            </form>

            {verifiedMessage && (
                <div style={{ color: '#34d399', marginBottom: 12 }}>
                    {verifiedMessage}
                </div>
            )}
        </div>
    );
}