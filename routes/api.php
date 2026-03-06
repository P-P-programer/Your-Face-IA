<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ConnectionController;
use App\Http\Controllers\DetectionController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\VerifyEmailApiController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DeviceTokenRequestController;
use App\Http\Controllers\TokenRevocationController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/verify-email/{id}/{hash}', [VerifyEmailApiController::class, 'verify']);

// ESP32 CON TOKEN (sin middleware auth)
Route::middleware('api.token')->group(function () {
    Route::post('/devices/register', [DeviceController::class, 'register']);
    Route::post('/devices/heartbeat', [DeviceController::class, 'heartbeat']);
});

// USUARIO AUTENTICADO
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/connections', [ConnectionController::class, 'myConnections']);
    Route::get('/connections/user/{userId}', [ConnectionController::class, 'userConnections']);
    Route::post('/connections/{connectionId}/disconnect', [ConnectionController::class, 'disconnectDevice']);

    Route::get('/devices', [DeviceController::class, 'myDevices']);
    Route::post('/devices/{deviceId}/disconnect', [DeviceController::class, 'disconnect']);
    Route::get('/devices/all', [DeviceController::class, 'allDevices']);

    Route::get('/detections', [DetectionController::class, 'myDetections']);
    Route::get('/detections/recent', [DetectionController::class, 'recentDetections']);
    Route::get('/detections/all', [DetectionController::class, 'allDetections']);
    Route::post('/detections/demo', [DetectionController::class, 'demoDetection']);

    // Solicitudes de token
    Route::post('/device-tokens/request', [DeviceTokenRequestController::class, 'store']);
    Route::get('/device-tokens/my-requests', [DeviceTokenRequestController::class, 'myRequests']);

    // Solicitudes de revocación
    Route::post('/tokens/revoke-request', [TokenRevocationController::class, 'store']);
    Route::get('/tokens/my-revocation-requests', [TokenRevocationController::class, 'myRequests']);
});

// SUPER ADMIN ONLY
Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
    Route::get('/connections/all', [ConnectionController::class, 'allConnections']);

    Route::prefix('admin')->group(function () {
        // Gestión de solicitudes de token
        Route::get('/device-token-requests', [DeviceTokenRequestController::class, 'index']);
        Route::post('/device-token-requests/{tokenRequest}/approve', [DeviceTokenRequestController::class, 'approve']);
        Route::post('/device-token-requests/{tokenRequest}/reject', [DeviceTokenRequestController::class, 'reject']);

        // Gestión de revocaciones
        Route::get('/token-revocation-requests', [TokenRevocationController::class, 'index']);
        Route::post('/token-revocation-requests/{revocationRequest}/approve', [TokenRevocationController::class, 'approve']);
        Route::post('/token-revocation-requests/{revocationRequest}/reject', [TokenRevocationController::class, 'reject']);
    });
});