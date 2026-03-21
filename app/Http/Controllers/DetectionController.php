<?php

namespace App\Http\Controllers;

use App\Models\Detection;
use App\Models\DeviceRegistration;
use Illuminate\Http\Request;

class DetectionController extends Controller
{
    // Usuario ve sus detecciones
    public function myDetections(Request $request)
    {
        $query = Detection::where('user_id', $request->user()->id);

        if ($request->filled('device_ip')) {
            $query->where('device_ip', $request->string('device_ip'));
        }

        $detections = $query
            ->orderByDesc('detected_at')
            ->paginate(50);

        return response()->json($detections);
    }

    // ESP32 registra una detección
    public function store(Request $request)
    {
        $data = $request->validate([
            'device_ip' => ['required', 'string'],
            'device_mac' => ['required', 'string', 'max:17'],
            'face_count' => ['required', 'integer', 'min:0'],
            'confidence' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'image_path' => ['nullable', 'string'],
            'status' => ['required', 'in:detected,recognized,unknown'],
            'metadata' => ['nullable', 'array'],
        ]);

        $userId = (int) $request->user_id;
        $deviceMac = strtoupper(trim($data['device_mac']));

        $device = DeviceRegistration::where('user_id', $userId)
            ->where('device_mac', $deviceMac)
            ->first();

        if (!$device) {
            return response()->json([
                'message' => 'Dispositivo no autorizado para este token',
            ], 403);
        }

        $metadata = $data['metadata'] ?? [];
        $metadata['device_mac'] = $deviceMac;
        $metadata['device_name'] = $device->device_name;

        $detection = Detection::create([
            'user_id' => $userId,
            'device_ip' => $data['device_ip'],
            'face_count' => $data['face_count'],
            'confidence' => $data['confidence'] ?? null,
            'image_path' => $data['image_path'] ?? null,
            'status' => $data['status'],
            'metadata' => $metadata,
            'detected_at' => now(),
        ]);

        return response()->json([
            'message' => 'Detección registrada',
            'detection' => $detection,
        ], 201);
    }

    // Dashboard: últimas detecciones (últimas 24h)
    public function recentDetections(Request $request)
    {
        $query = Detection::where('user_id', $request->user()->id)
            ->where('detected_at', '>=', now()->subDay());

        if ($request->filled('device_ip')) {
            $query->where('device_ip', $request->string('device_ip'));
        }

        $detections = $query
            ->orderByDesc('detected_at')
            ->limit(20)
            ->get();

        $stats = [
            'total_today' => Detection::where('user_id', $request->user()->id)
                ->where('detected_at', '>=', now()->startOfDay())
                ->count(),
            'total_week' => Detection::where('user_id', $request->user()->id)
                ->where('detected_at', '>=', now()->subWeek())
                ->count(),
            'faces_today' => Detection::where('user_id', $request->user()->id)
                ->where('detected_at', '>=', now()->startOfDay())
                ->sum('face_count'),
        ];

        return response()->json([
            'detections' => $detections,
            'stats' => $stats,
        ]);
    }

    // Superadmin: todas las detecciones
    public function allDetections(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $detections = Detection::with('user:id,name,email')
            ->orderByDesc('detected_at')
            ->paginate(100);

        return response()->json($detections);
    }
}
