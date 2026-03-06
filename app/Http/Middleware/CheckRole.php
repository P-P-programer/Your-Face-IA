<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        
        // DEBUG temporal
        Log::info('CheckRole middleware', [
            'user_id' => $user?->id,
            'user_role' => $user?->role,
            'required_roles' => $roles,
            'matched' => $user && in_array($user->role, $roles),
        ]);

        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        if (!in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'No autorizado',
                'your_role' => $user->role,
                'required' => $roles,
            ], 403);
        }

        return $next($request);
    }
}