<?php

namespace App\Http\Controllers;

use App\Models\DeviceRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class DeviceController extends Controller
{
    // ESP32 se registra (COM TOKEN)
    public function register(Request $request)
    {
        try {
            $data = $request->validate([
                'device_name' => ['required', 'string', 'max:50'],
                'device_ip' => ['required', 'ip'],
                'device_mac' => ['required', 'string', 'max:17'],
                'model' => ['nullable', 'string', 'max:50'],
                'signal_strength' => ['nullable', 'integer', 'min:-100', 'max:0'],
                'stream_url' => ['nullable', 'url', 'max:500'],
                'snapshot_url' => ['nullable', 'url', 'max:500'],
            ]);

            $userId = (int) $request->user_id;
            $apiToken = $request->get('apiToken');

            if (!$apiToken) {
                return response()->json(['message' => 'Token no disponible en request'], 401);
            }

            $incomingMac = strtoupper(trim($data['device_mac']));
            $tokenMac = $apiToken->device_mac ? strtoupper(trim($apiToken->device_mac)) : null;

            // Primer uso del token: queda ligado a este device_mac
            if (is_null($tokenMac)) {
                $apiToken->update(['device_mac' => $incomingMac]);
            } elseif ($tokenMac !== $incomingMac) {
                return response()->json([
                    'message' => 'Token asociado a otro dispositivo',
                ], 403);
            }

            // Aislamiento real por user_id + device_mac
            $device = DeviceRegistration::updateOrCreate(
                [
                    'user_id' => $userId,
                    'device_mac' => $incomingMac,
                ],
                [
                    'device_name' => $data['device_name'],
                    'device_ip' => $data['device_ip'],
                    'stream_url' => $data['stream_url'] ?? null,
                    'snapshot_url' => $data['snapshot_url'] ?? null,
                    'model' => $data['model'] ?? 'Unknown',
                    'status' => 'active',
                    'signal_strength' => $data['signal_strength'] ?? null,
                    'connected_at' => now(),
                    'last_heartbeat' => now(),
                ]
            );

            return response()->json([
                'message' => 'Dispositivo registrado correctamente',
                'device' => $device,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al registrar dispositivo',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ESP32 envía heartbeat (SIN AUTENTICACIÓN)
    public function heartbeat(Request $request)
    {
        try {
            $data = $request->validate([
                'device_mac' => ['required', 'string', 'max:17'],
                'device_ip' => ['required', 'ip'],
                'signal_strength' => ['nullable', 'integer'],
                'stream_url' => ['nullable', 'url', 'max:500'],
                'snapshot_url' => ['nullable', 'url', 'max:500'],
            ]);

            $userId = (int) $request->user_id;
            $apiToken = $request->get('apiToken');

            if (!$apiToken) {
                return response()->json(['message' => 'Token no disponible en request'], 401);
            }

            $incomingMac = strtoupper(trim($data['device_mac']));
            $tokenMac = $apiToken->device_mac ? strtoupper(trim($apiToken->device_mac)) : null;

            if ($tokenMac && $tokenMac !== $incomingMac) {
                return response()->json([
                    'message' => 'Token asociado a otro dispositivo',
                ], 403);
            }

            $device = DeviceRegistration::where('user_id', $userId)
                ->where('device_mac', $incomingMac)
                ->first();

            if (!$device) {
                return response()->json([
                    'message' => 'Dispositivo no registrado para este usuario',
                ], 404);
            }

            $device->update([
                'device_ip' => $data['device_ip'],
                'stream_url' => $data['stream_url'] ?? $device->stream_url,
                'snapshot_url' => $data['snapshot_url'] ?? $device->snapshot_url,
                'signal_strength' => $data['signal_strength'] ?? null,
                'last_heartbeat' => now(),
                'status' => 'active',
            ]);

            return response()->json([
                'message' => 'Heartbeat recibido',
                'device' => $device,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error en heartbeat',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Usuario ve sus dispositivos
    public function myDevices(Request $request)
    {
        $devices = DeviceRegistration::where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->orderByDesc('last_heartbeat')
            ->get();

        return response()->json($devices);
    }

    // Desconecta un dispositivo
    public function disconnect(Request $request, $deviceId)
    {
        $device = DeviceRegistration::findOrFail($deviceId);

        if ($device->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $device->update([
            'status' => 'disconnected',
            'disconnected_at' => now(),
        ]);

        return response()->json([
            'message' => 'Dispositivo desconectado',
            'device' => $device,
        ]);
    }

    // Superadmin ve todos los dispositivos
    public function allDevices(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $devices = DeviceRegistration::with('user:id,name,email')
            ->orderByDesc('last_heartbeat')
            ->paginate(100);

        return response()->json($devices);
    }

    // Devuelve enlaces de cámara
    public function cameraLinks(Request $request, DeviceRegistration $device)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }
        if ($device->user_id !== $user->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $ttl = max(30, (int) env('CAMERA_LINK_TTL_SECONDS', 120));
        $expiresAt = now()->addSeconds($ttl);

        return response()->json([
            'stream_url' => $device->stream_url
                ? URL::temporarySignedRoute('camera.stream', $expiresAt, ['device' => $device->id])
                : null,
            'snapshot_url' => $device->snapshot_url
                ? URL::temporarySignedRoute('camera.snapshot', $expiresAt, ['device' => $device->id])
                : null,
            'expires_at' => $expiresAt->toIso8601String(),
        ]);
    }

    private function publicCameraUrl(?string $url)
    {
        if (!$url) return null;
        // Detecta si la URL es local (IP privada)
        if (preg_match('#^http://192\.168\.1\.\d+(:\d+)?(/stream|/capture)$#', $url, $m)) {
            // Detecta si es stream o capture
            $path = $m[2];
            return "https://cam.your-face-ia.site$path";
        }
        return $url;
    }
}
