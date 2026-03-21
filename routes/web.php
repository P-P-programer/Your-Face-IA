<?php

use App\Http\Controllers\CameraProxyController;
use App\Http\Controllers\VerifyEmailController;
use Illuminate\Support\Facades\Route;

// Ruta de verificación de email
Route::get('/verify-email/{id}/{hash}', VerifyEmailController::class)
    ->name('verification.verify');

// Servir sw.js con MIME correcto (ANTES del catch-all)
Route::get('/sw.js', function () {
    return response()->file(public_path('sw.js'), [
        'Content-Type' => 'application/javascript; charset=utf-8',
        'Cache-Control' => 'no-cache, no-store, must-revalidate',
        'Pragma' => 'no-cache',
        'Expires' => '0',
    ]);
});

// Servir manifest.json con MIME correcto
Route::get('/manifest.json', function () {
    return response()->file(public_path('manifest.json'), [
        'Content-Type' => 'application/json; charset=utf-8',
        'Cache-Control' => 'no-cache, no-store, must-revalidate',
        'Pragma' => 'no-cache',
        'Expires' => '0',
    ]);
});

// Ruta principal
Route::get('/', function () {
    return view('welcome');
});

// Ruta de streaming de cámara
Route::get('/camera/stream/{device}', [CameraProxyController::class, 'stream'])
    ->middleware('signed')
    ->name('camera.stream');

// Ruta de snapshot de cámara
Route::get('/camera/snapshot/{device}', [CameraProxyController::class, 'snapshot'])
    ->middleware('signed')
    ->name('camera.snapshot');

// Catch-all siempre al final
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
