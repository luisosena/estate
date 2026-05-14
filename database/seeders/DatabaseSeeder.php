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
     * - DevelopmentSeeder: only runs in local/staging — seeds demo landlords,
     *   tenants, properties, payments, etc. for development and testing.
     *   It first truncates all tables, so it must never run in production.
     */
    public function run(): void
    {
        $this->call(UtilityTypeSeeder::class);

        if (app()->isLocal() || app()->environment('staging')) {
            $this->call(DevelopmentSeeder::class);
        }
    }
}
