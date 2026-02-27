<?php

namespace App\Http\Controllers;

use App\Models\DeviceRegistration;
use Illuminate\Http\Request;

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
            ]);

            // ✅ Obtener user_id del token
            $userId = $request->user_id;

            $device = DeviceRegistration::updateOrCreate(
                ['device_mac' => $data['device_mac']],
                [
                    'user_id' => $userId,
                    'device_name' => $data['device_name'],
                    'device_ip' => $data['device_ip'],
                    'model' => $data['model'] ?? 'Unknown',
                    'status' => 'active',
                    'signal_strength' => $data['signal_strength'],
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
                'device_mac' => ['required', 'string'],
                'device_ip' => ['required', 'ip'],
                'signal_strength' => ['nullable', 'integer'],
            ]);

            $device = DeviceRegistration::where('device_mac', $data['device_mac'])->first();

            if (!$device) {
                return response()->json([
                    'message' => 'Dispositivo no registrado',
                ], 404);
            }

            $device->update([
                'device_ip' => $data['device_ip'],
                'signal_strength' => $data['signal_strength'],
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
        if ($request->user()->role !== 'superadmin') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $devices = DeviceRegistration::with('user:id,name,email')
            ->orderByDesc('last_heartbeat')
            ->paginate(100);

        return response()->json($devices);
    }
}
