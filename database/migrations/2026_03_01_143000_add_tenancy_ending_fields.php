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
        Schema::table('tenancies', function (Blueprint $table) {
            $table->string('end_reason')->nullable()->after('move_out_date');
            $table->string('deposit_return_status')->nullable()->after('end_reason');
            $table->text('final_meter_readings')->nullable()->after('deposit_return_status');
        });

        // Update existing records to set default end_reason for manually ended tenancies
        \DB::table('tenancies')
            ->where('status', 'ended')
            ->whereNull('end_reason')
            ->update(['end_reason' => 'manual_ending']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenancies', function (Blueprint $table) {
            $table->dropColumn(['end_reason', 'deposit_return_status', 'final_meter_readings']);
        });
    }
};
