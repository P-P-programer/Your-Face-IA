<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ConnectionController;
use App\Http\Controllers\VerifyEmailApiController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/verify-email/{id}/{hash}', [VerifyEmailApiController::class, 'verify']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Conexiones (auditoría)
    Route::get('/connections', [ConnectionController::class, 'myConnections']);
    Route::get('/connections/all', [ConnectionController::class, 'allConnections']);
    Route::get('/connections/user/{userId}', [ConnectionController::class, 'userConnections']);
    Route::post('/connections/{connectionId}/disconnect', [ConnectionController::class, 'disconnectDevice']);
});