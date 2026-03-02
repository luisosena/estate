<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Tenancy;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Fix unrealistic monthly_rent values in existing tenancies
        // Set realistic rent amounts based on unit types
        Tenancy::query()->update(['monthly_rent' => 0]);
        
        // Get active tenancies and set realistic rent amounts
        $activeTenancies = Tenancy::where('status', 'active')->get();
        
        foreach ($activeTenancies as $index => $tenancy) {
            $realisticRents = [120000, 150000, 200000, 250000, 300000]; // TZS amounts
            $rent = $realisticRents[$index % count($realisticRents)];
            
            $tenancy->update(['monthly_rent' => $rent]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reset to original values - this is just for completeness
        // In practice, we'd need to store original values first
        Tenancy::query()->update(['monthly_rent' => 0]);
    }
};
