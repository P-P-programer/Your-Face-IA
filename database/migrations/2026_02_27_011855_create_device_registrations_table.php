<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('device_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('device_name'); // ESP32-CAM, etc
            $table->string('device_ip');
            $table->string('device_mac')->nullable(); // MAC address del ESP32
            $table->string('model')->nullable(); // TTGO-T-CAM, etc
            $table->string('status')->default('active'); // active, inactive, disconnected
            $table->integer('signal_strength')->nullable(); // RSSI (WiFi signal)
            $table->timestamp('connected_at');
            $table->timestamp('disconnected_at')->nullable();
            $table->timestamp('last_heartbeat')->nullable(); // Último ping
            $table->text('metadata')->nullable(); // JSON con info adicional
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['device_ip']);
            $table->unique(['user_id', 'device_mac']); // Un usuario no puede registrar el mismo ESP32 dos veces
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_registrations');
    }
};
