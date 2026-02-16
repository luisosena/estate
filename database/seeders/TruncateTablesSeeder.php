<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TruncateTablesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        // Truncate tables in correct order (respecting foreign keys)
        DB::table('messages')->truncate();
        DB::table('notifications')->truncate();
        DB::table('utilities')->truncate();
        DB::table('payments')->truncate();
        DB::table('tenant_identifications')->truncate();
        DB::table('tenancies')->truncate();
        DB::table('users')->truncate();
        DB::table('tenants')->truncate();
        DB::table('units')->truncate();

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
}