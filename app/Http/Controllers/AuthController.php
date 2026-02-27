<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Connection;
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

        // Invalida todos los tokens anteriores
        $user->tokens()->delete();

        // Registra desconexión del dispositivo anterior
        Connection::where('user_id', $user->id)
            ->where('status', 'active')
            ->update([
                'disconnected_at' => now(),
                'status' => 'disconnected',
            ]);

        // Registra nueva conexión
        Connection::create([
            'user_id' => $user->id,
            'device_ip' => $request->ip(),
            'device_type' => $this->detectDeviceType($request->userAgent()),
            'user_agent' => $request->userAgent(),
            'connected_at' => now(),
            'status' => 'active',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        // Registra desconexión
        Connection::where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->update([
                'disconnected_at' => now(),
                'status' => 'disconnected',
            ]);

        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada.',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    private function detectDeviceType($userAgent)
    {
        if (preg_match('/Mobile|Android|iPhone/', $userAgent)) {
            return 'mobile';
        } elseif (preg_match('/Tablet|iPad/', $userAgent)) {
            return 'tablet';
        }
        return 'desktop';
    }
}