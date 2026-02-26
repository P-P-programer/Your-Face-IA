<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'user',
            'status' => 'active',
            'preferences' => [
                'email_notifications' => true,
                'push_notifications' => true,
                'notify_new_connection' => true,
                'notify_alerts' => true,
            ],
        ]);

        UserStatus::create([
            'user_id' => $user->id,
            'status' => 'active',
            'reason' => 'Registro inicial',
        ]);

        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Registro exitoso. Revisa tu email para verificar.',
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credenciales inválidas.'],
            ]);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Usuario inactivo o suspendido.',
            ], 403);
        }

        if (is_null($user->email_verified_at)) {
            return response()->json([
                'message' => 'Debes verificar tu correo primero.',
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada.',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}