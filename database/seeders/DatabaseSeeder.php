<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * This is the single source of truth for all seeding.
     *
     * - UtilityTypeSeeder: always runs — seeds required lookup data using
     *   insertOrIgnore, so it is safe to run on every boot or fresh migration.
     *
     * - DevelopmentSeeder: always runs — seeds demo landlords, tenants,
     *   properties, payments, etc. It handles its own idempotency checks.
     */
    public function run(): void
    {
        $this->call(UtilityTypeSeeder::class);
        $this->call(DevelopmentSeeder::class);
    }
}
