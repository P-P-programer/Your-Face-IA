<?php

namespace App\Http\Controllers;

use App\Models\Detection;
use Illuminate\Http\Request;

class DetectionController extends Controller
{
    // Usuario ve sus detecciones
    public function myDetections(Request $request)
    {
        $detections = Detection::where('user_id', $request->user()->id)
            ->orderByDesc('detected_at')
            ->paginate(50);

        return response()->json($detections);
    }

    // ESP32 registra una detección
    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'device_ip' => ['required', 'string'],
            'face_count' => ['required', 'integer', 'min:0'],
            'confidence' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'image_path' => ['nullable', 'string'],
            'status' => ['required', 'in:detected,recognized,unknown'],
            'metadata' => ['nullable', 'array'],
        ]);

        $detection = Detection::create([
            ...$data,
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
        $detections = Detection::where('user_id', $request->user()->id)
            ->where('detected_at', '>=', now()->subDay())
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
        if ($request->user()->role !== 'superadmin') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $detections = Detection::with('user:id,name,email')
            ->orderByDesc('detected_at')
            ->paginate(100);

        return response()->json($detections);
    }
}
