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

    const handleSubmit = async e => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const url = mode === 'login' ? '/api/login' : '/api/register';
            const payload = mode === 'login'
                ? { email: form.email, password: form.password }
                : { name: form.name, email: form.email, password: form.password };

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const isJson = res.headers.get('content-type')?.includes('application/json');
            const data = isJson ? await res.json() : null;

            if (!res.ok) {
                const validationMsg = data?.errors
                    ? Object.values(data.errors).flat().join(' ')
                    : null;

                setError(validationMsg || data?.message || 'Error al autenticar');
                return;
            }

            if (mode === 'register') {
                setMessage('Registro exitoso. Revisa tu email para verificar.');
                return;
            }

            if (data?.token) {
                onAuth(data.token, data.user);
            }
        } catch {
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