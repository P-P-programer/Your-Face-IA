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
        $plainToken = trim((string) $request->header('X-API-Token', ''));

        if ($plainToken === '') {
            return response()->json([
                'message' => 'Token requerido',
            ], 401);
        }

        // El token se guarda hasheado en BD, nunca en texto plano
        $hashedToken = hash('sha256', $plainToken);

        $apiToken = ApiToken::where('token', $hashedToken)->first();

        if (!$apiToken) {
            return response()->json([
                'message' => 'Token inválido',
            ], 401);
        }

        // Solo tokens activos pueden autenticarse
        if ($apiToken->status !== 'active') {
            return response()->json([
                'message' => 'Token inactivo',
            ], 401);
        }

        // Si ya fue revocado explícitamente, no debe pasar
        if (!is_null($apiToken->revoked_at)) {
            return response()->json([
                'message' => 'Token revocado',
            ], 401);
        }

        // Verificar expiración (si existe fecha de expiración)
        if (!is_null($apiToken->expires_at)) {
            $expiresAt = $apiToken->expires_at instanceof \Carbon\CarbonInterface
                ? $apiToken->expires_at
                : now()->parse($apiToken->expires_at);

            if ($expiresAt->isPast()) {
                return response()->json([
                    'message' => 'Token expirado',
                ], 401);
            }
        }

        // Guardar contexto en request para controladores
        $request->merge([
            'apiToken' => $apiToken,
            'user_id' => $apiToken->user_id,
        ]);

        // Actualizar uso solo si autenticó correctamente
        $apiToken->update(['last_used_at' => now()]);

        return $next($request);
    }
}
