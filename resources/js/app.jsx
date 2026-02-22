import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import Layout from './components/Layout';
import ConnectDevice from './components/ConnectDevice';
import Dashboard from './components/Dashboard';
import './bootstrap';
import '../css/app.css';

function App() {
    const [deviceIp, setDeviceIp] = useState('');

    return (
        <Layout
            deviceIp={deviceIp}
            onConnect={setDeviceIp}
            onDisconnect={() => setDeviceIp('')}
        >
            {!deviceIp ? (
                <ConnectDevice onConnect={setDeviceIp} />
            ) : (
                <Dashboard deviceIp={deviceIp} />
            )}
        </Layout>
    );
}

const root = createRoot(document.getElementById('app'));
root.render(<App />);

