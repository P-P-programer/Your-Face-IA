<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class VerifyEmailController extends Controller
{
    public function __invoke(Request $request, $id, $hash)
    {
        // Verifica firma SIEMPRE en producción
        if (!URL::hasValidSignature($request)) {
            return redirect('/?verified=0&reason=invalid_signature');
        }

        $user = User::findOrFail($id);

        // Verifica hash del email
        if (!hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return redirect('/?verified=0&reason=invalid_hash');
        }

        // Marca como verificado
        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        return redirect('/?verified=1');
    }
}