<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('connections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('device_ip');
            $table->string('device_name')->nullable();
            $table->string('device_type'); // mobile, desktop, tablet
            $table->text('user_agent');
            $table->timestamp('connected_at');
            $table->timestamp('disconnected_at')->nullable();
            $table->string('status')->default('active'); // active, disconnected
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('connections');
    }
};
