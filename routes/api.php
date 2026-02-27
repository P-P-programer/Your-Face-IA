<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ConnectionController;
use App\Http\Controllers\DetectionController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\VerifyEmailApiController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/verify-email/{id}/{hash}', [VerifyEmailApiController::class, 'verify']);

//  ESP32 CON TOKEN (sin middleware auth)
Route::middleware('api.token')->group(function () {
    Route::post('/devices/register', [DeviceController::class, 'register']);
    Route::post('/devices/heartbeat', [DeviceController::class, 'heartbeat']);
});

//  USUARIO AUTENTICADO
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/connections', [ConnectionController::class, 'myConnections']);
    Route::get('/connections/all', [ConnectionController::class, 'allConnections']);
    Route::get('/connections/user/{userId}', [ConnectionController::class, 'userConnections']);
    Route::post('/connections/{connectionId}/disconnect', [ConnectionController::class, 'disconnectDevice']);

    Route::get('/devices', [DeviceController::class, 'myDevices']);
    Route::post('/devices/{deviceId}/disconnect', [DeviceController::class, 'disconnect']);
    Route::get('/devices/all', [DeviceController::class, 'allDevices']);

    Route::get('/detections', [DetectionController::class, 'myDetections']);
    Route::get('/detections/recent', [DetectionController::class, 'recentDetections']);
    Route::get('/detections/all', [DetectionController::class, 'allDetections']);
    Route::post('/detections/demo', [DetectionController::class, 'demoDetection']);
});