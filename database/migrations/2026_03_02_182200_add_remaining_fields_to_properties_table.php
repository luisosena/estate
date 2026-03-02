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
        Schema::table('properties', function (Blueprint $table) {
            // Location fields
            $table->string('city')->nullable()->after('address');
            $table->string('state')->nullable()->after('city');
            $table->string('postal_code', 20)->nullable()->after('state');
            $table->string('country')->nullable()->after('postal_code');

            // Property details
            $table->enum('property_type', ['apartment', 'house', 'commercial', 'mixed'])
                ->nullable()
                ->after('total_units');
            
            $table->enum('status', ['active', 'inactive', 'maintenance'])
                ->default('active')
                ->after('property_type');

            $table->text('description')->nullable()->after('status');

            // JSON fields for arrays
            $table->json('amenities')->nullable()->after('description');
            $table->json('policies')->nullable()->after('amenities');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn([
                'city',
                'state',
                'postal_code',
                'country',
                'property_type',
                'status',
                'description',
                'amenities',
                'policies'
            ]);
        });
    }
};
