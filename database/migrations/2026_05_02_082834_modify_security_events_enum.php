<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Change enum to string to support arbitrary event types
        Schema::table('security_events', function (Blueprint $table) {
            $table->string('event_type', 100)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Converting back to ENUM natively in Laravel can be tricky, 
        // we leave it as string or write raw SQL if absolutely needed.
        // It's safer to leave as string during rollback to prevent data loss.
    }
};
