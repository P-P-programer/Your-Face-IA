<?php

namespace App\Http\Controllers;

use App\Models\Connection;
use Illuminate\Http\Request;

class ConnectionController extends Controller
{
    // Usuario ve sus propias conexiones
    public function myConnections(Request $request)
    {
        $connections = Connection::where('user_id', $request->user()->id)
            ->orderByDesc('connected_at')
            ->get();

        return response()->json($connections);
    }

    // Superadmin ve todas las conexiones
    public function allConnections()
    {
        // NO DEBE HABER validación adicional de rol aquí
        // El middleware ya lo protege
        $connections = Connection::with('user')->latest()->get();
        return response()->json($connections);
    }

    // Superadmin ve conexiones de un usuario específico
    public function userConnections(Request $request, $userId)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json([
                'message' => 'No autorizado.'
            ], 403);
        }

        $connections = Connection::where('user_id', $userId)
            ->orderByDesc('connected_at')
            ->get();

        return response()->json($connections);
    }

    // Desconectar un dispositivo activo (superadmin)
    public function disconnectDevice(Request $request, $connectionId)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json([
                'message' => 'No autorizado.'
            ], 403);
        }

        $connection = Connection::findOrFail($connectionId);

        $connection->update([
            'disconnected_at' => now(),
            'status' => 'disconnected',
        ]);

        return response()->json([
            'message' => 'Dispositivo desconectado.',
            'connection' => $connection,
        ]);
    }
}
