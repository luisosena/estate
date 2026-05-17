<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('expo_push_token')->nullable()->after('remember_token');
            $table->timestamp('expo_push_token_updated_at')->nullable()->after('expo_push_token');
            $table->string('push_platform')->nullable()->after('expo_push_token_updated_at');
            $table->string('phone')->nullable()->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['expo_push_token', 'expo_push_token_updated_at', 'push_platform', 'phone']);
        });
    }
};
