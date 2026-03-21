<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ConnectionController;
use App\Http\Controllers\DetectionController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\DeviceTokenRequestController;
use App\Http\Controllers\TokenRevocationController;

// Públicas
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// ESP32 (token de dispositivo)
Route::middleware('api.token')->group(function () {
    Route::post('/devices/register', [DeviceController::class, 'register']);
    Route::post('/devices/heartbeat', [DeviceController::class, 'heartbeat']);
    Route::post('/devices/detections', [DetectionController::class, 'store']);
});

// Usuario autenticado (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/connections', [ConnectionController::class, 'myConnections']);
    Route::get('/connections/user/{userId}', [ConnectionController::class, 'userConnections']);
    Route::post('/connections/{connectionId}/disconnect', [ConnectionController::class, 'disconnectDevice']);

    Route::get('/devices', [DeviceController::class, 'myDevices']);
    Route::post('/devices/{deviceId}/disconnect', [DeviceController::class, 'disconnect']);

    Route::get('/detections', [DetectionController::class, 'myDetections']);
    Route::get('/detections/recent', [DetectionController::class, 'recentDetections']);

    // Solicitudes de token
    Route::post('/device-tokens/request', [DeviceTokenRequestController::class, 'store']);
    Route::get('/device-tokens/my-requests', [DeviceTokenRequestController::class, 'myRequests']);

    Route::post('/tokens/revoke-request', [TokenRevocationController::class, 'store']);
    Route::get('/tokens/my-revocation-requests', [TokenRevocationController::class, 'myRequests']);

    Route::get('/tokens/my-tokens', [TokenRevocationController::class, 'myTokens']);

    // Compat route que ya usas en frontend
    Route::middleware('role:user,super_admin')->post('/tokens/request', [DeviceTokenRequestController::class, 'store']);
    
    // Nueva ruta para obtener links de cámara
     Route::get('/devices/{device}/camera-links', [DeviceController::class, 'cameraLinks']);
});

// Solo super admin
Route::middleware(['auth:sanctum', 'role:super_admin'])->prefix('admin')->group(function () {
    Route::get('/connections', [ConnectionController::class, 'allConnections']);
    Route::post('/connections/{connectionId}/disconnect', [ConnectionController::class, 'disconnectDevice']);

    Route::get('/token-requests', [DeviceTokenRequestController::class, 'index']);
    Route::post('/token-requests/{tokenRequest}/approve', [DeviceTokenRequestController::class, 'approve']);
    Route::post('/token-requests/{tokenRequest}/reject', [DeviceTokenRequestController::class, 'reject']);

    Route::get('/revocation-requests', [TokenRevocationController::class, 'index']);
    Route::post('/revocation-requests/{revocationRequest}/approve', [TokenRevocationController::class, 'approve']);
    Route::post('/revocation-requests/{revocationRequest}/reject', [TokenRevocationController::class, 'reject']);
});
