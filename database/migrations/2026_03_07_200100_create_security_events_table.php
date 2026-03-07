<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('security_events', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->enum('event_type', [
                'password_changed',
                'password_reset_requested',
                'suspicious_activity',
                'unusual_location',
                'multiple_failed_attempts',
                'token_revoked',
                'session_terminated',
                'biometric_enabled',
                'biometric_disabled',
                'device_added',
                'device_removed',
            ]);
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->uuid('device_id')->nullable();
            $table->string('location')->nullable();
            $table->json('metadata')->nullable();
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('low');
            $table->timestamps();

            $table->index('user_id');
            $table->index('event_type');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('security_events');
    }
};
