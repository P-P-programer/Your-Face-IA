<?php

namespace App\Http\Middleware;

use App\Models\ApiToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckApiToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->header('X-API-Token');

        if (!$token) {
            return response()->json([
                'message' => 'Token requerido',
            ], 401);
        }

        $apiToken = ApiToken::where('token', $token)->first();

        if (!$apiToken) {
            return response()->json([
                'message' => 'Token inválido',
            ], 401);
        }

        // Verificar si expiró
        if ($apiToken->expires_at && $apiToken->expires_at->isPast()) {
            return response()->json([
                'message' => 'Token expirado',
            ], 401);
        }

        // Guardar en request
        $request->merge([
            'apiToken' => $apiToken,
            'user_id' => $apiToken->user_id,
        ]);

        // Actualizar last_used_at
        $apiToken->update(['last_used_at' => now()]);

        return $next($request);
    }
}
