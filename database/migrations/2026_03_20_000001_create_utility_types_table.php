<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('utility_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);               // e.g. 'Water', 'Electricity', 'Security'
            $table->string('unit', 50)->nullable();    // e.g. 'cubic metres', 'kWh', 'flat rate'
            $table->text('description')->nullable();   // optional detail for landlord UI
            $table->boolean('is_metered')->default(false); // true = usage-based billing
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('utility_types');
    }
};
