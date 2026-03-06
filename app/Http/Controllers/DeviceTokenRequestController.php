<?php

namespace App\Http\Controllers;

use App\Models\ApiToken;
use App\Models\DeviceTokenRequest;
use App\Notifications\TokenApproved;
use App\Notifications\TokenRejected;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DeviceTokenRequestController extends Controller
{
    // Usuario solicita token
    public function store(Request $request)
    {
        $request->validate([
            'device_name' => 'required|string|max:255',
            'reason' => 'nullable|string|max:500',
        ]);

        // Verificar si ya tiene una solicitud pendiente
        $existingRequest = DeviceTokenRequest::where('user_id', auth()->id())
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return response()->json([
                'message' => 'Ya tienes una solicitud pendiente.',
            ], 400);
        }

        $tokenRequest = DeviceTokenRequest::create([
            'user_id' => auth()->id(),
            'device_name' => $request->device_name,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Solicitud enviada. Espera aprobación del administrador.',
            'request' => $tokenRequest,
        ], 201);
    }

    // Usuario ve sus solicitudes
    public function myRequests()
    {
        $requests = DeviceTokenRequest::where('user_id', auth()->id())
            ->with('reviewer')
            ->latest()
            ->get();

        return response()->json($requests);
    }

    // Admin lista solicitudes (middleware ya valida super_admin)
    public function index(Request $request)
    {
        $status = $request->query('status', 'pending');

        $requests = DeviceTokenRequest::with(['user', 'reviewer'])
            ->when($status !== 'all', fn($q) => $q->where('status', $status))
            ->latest()
            ->paginate(20);

        return response()->json($requests);
    }

    // Admin aprueba solicitud (middleware ya valida super_admin)
    public function approve(Request $request, DeviceTokenRequest $tokenRequest)
    {
        if ($tokenRequest->status !== 'pending') {
            return response()->json(['message' => 'Solicitud ya procesada'], 400);
        }

        $request->validate([
            'admin_notes' => 'nullable|string|max:500',
        ]);

        // Generar token único
        $plainToken = Str::random(64);
        $hashedToken = hash('sha256', $plainToken);

        $apiToken = ApiToken::create([
            'user_id' => $tokenRequest->user_id,
            'name' => $tokenRequest->device_name,
            'token' => $hashedToken,
            'device_mac' => '00:00:00:00:00:00', // Se actualiza cuando el ESP32 se conecte
            'status' => 'active',
        ]);

        // Actualizar solicitud
        $tokenRequest->update([
            'status' => 'approved',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
            'admin_notes' => $request->admin_notes,
        ]);

        $tokenRequest->user->notify(new TokenApproved($plainToken, $tokenRequest->device_name));

        return response()->json([
            'message' => 'Token aprobado y enviado al usuario',
            'token' => $plainToken,
            'api_token_id' => $apiToken->id,
        ]);
    }

    // Admin rechaza solicitud (middleware ya valida super_admin)
    public function reject(Request $request, DeviceTokenRequest $tokenRequest)
    {
        if ($tokenRequest->status !== 'pending') {
            return response()->json(['message' => 'Solicitud ya procesada'], 400);
        }

        $request->validate([
            'admin_notes' => 'required|string|max:500',
        ]);

        $tokenRequest->update([
            'status' => 'rejected',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
            'admin_notes' => $request->admin_notes,
        ]);

        // Notificar usuario
        $tokenRequest->user->notify(new TokenRejected($request->admin_notes));

        return response()->json([
            'message' => 'Solicitud rechazada',
        ]);
    }
}
