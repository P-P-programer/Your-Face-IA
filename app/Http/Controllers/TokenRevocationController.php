<?php

namespace App\Http\Controllers;

use App\Models\ApiToken;
use App\Models\TokenRevocationRequest;
use App\Notifications\RevocationApproved;
use App\Notifications\RevocationRejected;
use Illuminate\Http\Request;

class TokenRevocationController extends Controller
{
    // Usuario solicita revocar su token
    public function store(Request $request)
    {
        $request->validate([
            'api_token_id' => 'required|exists:api_tokens,id',
            'reason' => 'required|string|max:500',
        ]);

        $apiToken = ApiToken::findOrFail($request->api_token_id);

        // Verificar que el token pertenezca al usuario
        if ($apiToken->user_id !== auth()->id()) {
            return response()->json(['message' => 'Token no autorizado'], 403);
        }

        // Verificar que el token esté activo
        if ($apiToken->status !== 'active') {
            return response()->json(['message' => 'Token ya está inactivo'], 400);
        }

        // Verificar si ya existe una solicitud pendiente
        $existingRequest = TokenRevocationRequest::where('api_token_id', $apiToken->id)
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return response()->json(['message' => 'Ya existe una solicitud pendiente para este token'], 400);
        }

        $revocationRequest = TokenRevocationRequest::create([
            'user_id' => auth()->id(),
            'api_token_id' => $apiToken->id,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Solicitud de cancelación enviada',
            'request' => $revocationRequest,
        ], 201);
    }

    // Usuario ve sus solicitudes de revocación
    public function myRequests()
    {
        $requests = TokenRevocationRequest::where('user_id', auth()->id())
            ->with(['apiToken', 'reviewer'])
            ->latest()
            ->get();

        return response()->json($requests);
    }

    // Usuario ve sus tokens (aprobados + revocados)
    public function myTokens()
    {
        $tokens = ApiToken::where('user_id', auth()->id())
            ->select(['id', 'name', 'status', 'revoked_at', 'created_at'])
            ->latest()
            ->get();

        return response()->json($tokens);
    }

    // Admin lista solicitudes (middleware ya valida super_admin)
    public function index(Request $request)
    {
        $status = $request->query('status', 'pending');

        $requests = TokenRevocationRequest::with(['user', 'apiToken', 'reviewer'])
            ->when($status !== 'all', fn($q) => $q->where('status', $status))
            ->latest()
            ->paginate(20);

        return response()->json($requests);
    }

    // Admin aprueba revocación (middleware ya valida super_admin)
    public function approve(Request $request, TokenRevocationRequest $revocationRequest)
    {
        if ($revocationRequest->status !== 'pending') {
            return response()->json(['message' => 'Solicitud ya procesada'], 400);
        }

        $request->validate([
            'admin_notes' => 'nullable|string|max:500',
        ]);

        // Revocar el token
        $revocationRequest->apiToken->revoke(auth()->id());

        // Actualizar solicitud
        $revocationRequest->update([
            'status' => 'approved',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
            'admin_notes' => $request->admin_notes,
        ]);

        // Notificar usuario
        $revocationRequest->user->notify(new RevocationApproved(
            $revocationRequest->apiToken->name,
            $request->admin_notes
        ));

        return response()->json([
            'message' => 'Token revocado exitosamente',
        ]);
    }

    // Admin rechaza revocación (middleware ya valida super_admin)
    public function reject(Request $request, TokenRevocationRequest $revocationRequest)
    {
        if ($revocationRequest->status !== 'pending') {
            return response()->json(['message' => 'Solicitud ya procesada'], 400);
        }

        $request->validate([
            'admin_notes' => 'required|string|max:500',
        ]);

        $revocationRequest->update([
            'status' => 'rejected',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
            'admin_notes' => $request->admin_notes,
        ]);

        $revocationRequest->user->notify(new RevocationRejected(
            $revocationRequest->apiToken->name,
            $request->admin_notes
        ));

        return response()->json([
            'message' => 'Solicitud de revocación rechazada',
        ]);
    }
}
