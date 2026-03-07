<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('api_tokens', function (Blueprint $table) {
            // Device identification
            $table->uuid('device_id')->nullable();
            $table->string('device_name')->nullable();
            $table->enum('device_type', ['ios', 'android', 'web'])->nullable();
            $table->string('device_fingerprint')->nullable();

            // Network information
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('location')->nullable();

            // Biometric authentication
            $table->boolean('biometric_enabled')->default(false);
            $table->string('biometric_key_id')->nullable();

            // Session management
            $table->timestamp('last_activity_at')->nullable();
            $table->boolean('is_current')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('api_tokens', function (Blueprint $table) {
            $table->dropColumn([
                'device_id',
                'device_name',
                'device_type',
                'device_fingerprint',
                'ip_address',
                'user_agent',
                'location',
                'biometric_enabled',
                'biometric_key_id',
                'last_activity_at',
                'is_current',
            ]);
        });
    }
};
