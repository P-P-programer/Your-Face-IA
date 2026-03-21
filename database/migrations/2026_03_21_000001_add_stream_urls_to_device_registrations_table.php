<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('device_registrations', function (Blueprint $table) {
            if (!Schema::hasColumn('device_registrations', 'stream_url')) {
                $table->string('stream_url', 500)->nullable()->after('device_ip');
            }

            if (!Schema::hasColumn('device_registrations', 'snapshot_url')) {
                $table->string('snapshot_url', 500)->nullable()->after('stream_url');
            }
        });
    }

    public function down(): void
    {
        Schema::table('device_registrations', function (Blueprint $table) {
            $columnsToDrop = [];

            if (Schema::hasColumn('device_registrations', 'stream_url')) {
                $columnsToDrop[] = 'stream_url';
            }

            if (Schema::hasColumn('device_registrations', 'snapshot_url')) {
                $columnsToDrop[] = 'snapshot_url';
            }

            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
