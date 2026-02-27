<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ThrottleVerification
{
    public function handle(Request $request, Closure $next)
    {
        // Solo throttle en ruta de verificación
        if (!$request->is('api/verify-email/*')) {
            return $next($request);
        }

        $key = "verify_{$request->ip()}_{$request->path()}";

        if (Cache::has($key)) {
            return response()->json([
                'message' => 'Ya se está procesando una verificación. Por favor espera.'
            ], 429); // 429 = Too Many Requests
        }

        // Marca como procesando por 5 segundos
        Cache::put($key, true, now()->addSeconds(5));

        return $next($request);
    }
}
