<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('api_tokens', function (Blueprint $table) {
            $table->enum('status', ['active', 'revoked', 'expired'])->default('active')->after('device_mac');
            $table->timestamp('revoked_at')->nullable()->after('status');
            $table->foreignId('revoked_by')->nullable()->constrained('users')->onDelete('set null')->after('revoked_at');
            
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::table('api_tokens', function (Blueprint $table) {
            $table->dropColumn(['status', 'revoked_at', 'revoked_by']);
        });
    }
};
