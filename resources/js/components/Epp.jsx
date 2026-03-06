import React from 'react';
import { getToken, getUser } from '../lib/session';
//funcion debug para mostrar el token y el user en pantalla, solo para desarrollo, no mostrar en produccion
export default function Epp() {
    const token = getToken();
    const user = getUser();

    return (
        <div style={{ 
            position: 'fixed', 
            bottom: 10, 
            right: 10, 
            background: '#1e293b', 
            color: '#10b981',
            padding: 16,
            borderRadius: 8,
            fontSize: 12,
            fontFamily: 'monospace',
            maxWidth: 400,
            zIndex: 9999,
            border: '2px solid #10b981'
        }}>
            <h3 style={{ margin: 0, marginBottom: 8, color: '#34d399' }}>🔍 Debug Session</h3>
            <div><b>Token existe:</b> {token ? '✅ Sí' : '❌ No'}</div>
            <div><b>Token (primeros 20):</b> {token ? token.substring(0, 20) + '...' : 'N/A'}</div>
            <div><b>User existe:</b> {user ? '✅ Sí' : '❌ No'}</div>
            {user && (
                <>
                    <div><b>User ID:</b> {user.id}</div>
                    <div><b>Email:</b> {user.email}</div>
                    <div><b>Role:</b> <span style={{ color: user.role === 'super_admin' ? '#10b981' : '#ef4444' }}>{user.role}</span></div>
                    <div><b>Status:</b> {user.status}</div>
                </>
            )}
        </div>
    );
}