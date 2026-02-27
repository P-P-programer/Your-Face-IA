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
    public function allConnections(Request $request)
    {
        if ($request->user()->role !== 'superadmin') {
            return response()->json([
                'message' => 'No autorizado. Solo superadmin puede ver esto.'
            ], 403);
        }

        $connections = Connection::with('user:id,name,email')
            ->orderByDesc('connected_at')
            ->paginate(50);

        return response()->json($connections);
    }

    // Superadmin ve conexiones de un usuario específico
    public function userConnections(Request $request, $userId)
    {
        if ($request->user()->role !== 'superadmin') {
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
        if ($request->user()->role !== 'superadmin') {
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
