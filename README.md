# Your Face IA

Your Face IA es una plataforma Laravel + React para registrar dispositivos ESP32-CAM, publicar su video de forma segura y mostrar el estado de cada camara desde un dashboard web.

El backend actua como proxy de la camara para evitar problemas de mixed content y para exponer solo URLs firmadas y temporales al navegador.

## Que hace el proyecto

- Registra dispositivos con token.
- Guarda stream y snapshot de cada camara.
- Convierte automaticamente URLs locales del ESP32 en una URL publica cuando aplica.
- Genera links firmados y temporales para ver stream y snapshot.
- Muestra en el dashboard el ultimo estado, actividad y detecciones recientes.
- Protege el acceso con Laravel Sanctum y firmas de URL.

## Flujo de camara

1. El ESP32-CAM se registra o envia heartbeat al backend.
2. El backend guarda `stream_url` y `snapshot_url` en `device_registrations`.
3. Si la URL llega como IP local, el backend puede reemplazarla por la URL publica del tunel.
4. El dashboard pide links firmados con `GET /api/devices/{device}/camera-links`.
5. Laravel sirve la camara desde `GET /camera/stream/{device}` y `GET /camera/snapshot/{device}`.

## Stack

- Backend: Laravel 12
- Autenticacion: Laravel Sanctum
- Frontend: React 18 con Vite
- Base de datos: SQLite por defecto en desarrollo
- Protocolo de camara: HTTP/MJPEG desde ESP32-CAM

## Requisitos

- PHP 8.2 o superior
- Composer
- Node.js 22.12+ y npm 10+
- Base de datos configurada en `.env`

## Instalacion

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
```

Si usas assets compilados para produccion:

```bash
npm run build
```

## Ejecucion local

En desarrollo puedes levantar todo con:

```bash
composer run dev
```

Tambien puedes correrlo por separado:

```bash
php artisan serve
npm run dev
php artisan queue:listen --tries=1 --timeout=0
php artisan pail --timeout=0
```

## Variables de entorno importantes

Revisa al menos estas variables en `.env`:

```env
APP_NAME=Your Face IA
APP_URL=http://localhost

DB_CONNECTION=sqlite

QUEUE_CONNECTION=database

CAMERA_LINK_TTL_SECONDS=120
```

Notas:

- `APP_URL` debe apuntar al dominio real en produccion para que los links firmados funcionen bien.
- `CAMERA_LINK_TTL_SECONDS` controla cuanto duran los links de camara.

## Endpoints principales

### Publicos

- `POST /api/login`
- `POST /api/register`

### Dispositivos ESP32

Protegidos por el middleware `api.token`.

- `POST /api/devices/register`
- `POST /api/devices/heartbeat`
- `POST /api/devices/detections`

### Usuario autenticado

Protegidos por `auth:sanctum`.

- `GET /api/devices`
- `GET /api/devices/{device}/camera-links`
- `POST /api/devices/{deviceId}/disconnect`
- `GET /api/detections`
- `GET /api/detections/recent`
- `POST /api/tokens/request`

### Proxy de camara

- `GET /camera/stream/{device}`
- `GET /camera/snapshot/{device}`

Estos endpoints usan firma temporal y no deben exponerse directamente al ESP32 ni al navegador sin pasar por Laravel.

## Comportamiento del proxy

El proxy valida que la URL de la camara sea compatible con el origen esperado antes de consumirla.

Soporta dos escenarios:

- URL local del ESP32, por ejemplo `http://192.168.1.50:81/stream` o `http://192.168.1.50/capture`
- URL publica via tunel, por ejemplo `https://cam.your-face-ia.site/stream` o `https://cam.your-face-ia.site/capture`

Si la URL no coincide con un formato permitido, el backend responde con `404` o `502` segun el punto de fallo.

## Estructura relevante

- `app/Http/Controllers/DeviceController.php`: registro, heartbeat y links de camara
- `app/Http/Controllers/CameraProxyController.php`: proxy de stream y snapshot
- `routes/api.php`: endpoints para app, autenticacion y dispositivos
- `routes/web.php`: rutas firmadas del proxy de camara
- `resources/js/components/Dashboard.jsx`: panel principal de la camara

## Despliegue y camaras en produccion

En produccion el flujo recomendado es usar una URL publica segura para la camara, por ejemplo mediante Cloudflare Tunnel, para evitar problemas de mixed content y accesos a IP privada desde internet.

Puntos a revisar antes de publicar:

- `APP_URL` debe coincidir con el dominio real.
- `device_registrations.stream_url` y `device_registrations.snapshot_url` deben quedar con la URL correcta.
- El dispositivo debe estar en estado `active` y con `last_heartbeat` reciente.
- La ruta de camara debe responder desde el origen esperado del ESP32 o del tunel.

## Comandos utiles

```bash
php artisan migrate
php artisan test
npm run build
php artisan route:list
```

## Licencia

Este proyecto mantiene la licencia MIT.
