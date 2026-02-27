<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('device_ip'); // IP del ESP32
            $table->integer('face_count'); // Cantidad de rostros detectados
            $table->decimal('confidence', 5, 2)->nullable(); // Confianza de detección (0-100)
            $table->text('image_path')->nullable(); // Ruta de la imagen capturada
            $table->string('status'); // detected, recognized, unknown
            $table->text('metadata')->nullable(); // JSON con datos adicionales
            $table->timestamp('detected_at'); // Hora exacta de detección
            $table->timestamps();
            
            $table->index(['user_id', 'detected_at']);
            $table->index(['device_ip', 'detected_at']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detections');
    }
};
