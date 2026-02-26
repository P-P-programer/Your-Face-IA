<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class VerifyEmailApiController extends Controller
{
    public function verify(Request $request, $id, $hash)
    {
        // Local: false (flexible), Producción: true (estricto)
        $strict = !app()->environment('local');
        $isValid = URL::hasValidSignature($request, $strict);

        if (!$isValid) {
            return response()->json(['message' => 'Link inválido o expirado'], 400);
        }

        $user = User::findOrFail($id);

        if (!hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return response()->json(['message' => 'Hash no coincide'], 400);
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        return response()->json([
            'message' => 'Email verificado correctamente',
            'user' => $user,
        ]);
    }
}