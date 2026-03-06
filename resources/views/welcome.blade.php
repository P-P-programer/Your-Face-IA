<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="theme-color" content="#10b981">
    <meta name="description" content="Sistema de detección de rostros con ESP32-CAM">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Your Face">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    @if(app()->environment('local'))
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">
    @endif
    
    <link rel="manifest" href="/manifest.json">
    <link rel="icon" type="image/png" href="/icon-192.png">
    <link rel="apple-touch-icon" href="/icon-192.png">
    
    <title>Your Face IA</title>
    @viteReactRefresh
    @vite(['resources/js/app.jsx', 'resources/css/app.css'])
</head>
<body style="margin:0; padding:0; font-family:sans-serif;">
    <div id="app"></div>
    
    <script>
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(reg => {
                console.log('Service Worker registrado:', reg);
                
                // Forzar actualización del SW
                reg.update();
                
                // Si hay una nueva versión esperando, activarla
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('Nueva versión disponible, recargando...');
                            window.location.reload();
                        }
                    });
                });
            }).catch(err => {
                console.error('Error registrando Service Worker:', err);
            });
        }
    </script>
</body>
</html>
