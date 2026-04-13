<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TruncateTablesSeeder extends Seeder
{
    /**
     * Truncate all application tables in dependency order.
     * Disables FK checks for MySQL during truncation.
     */
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        DB::table('messages')->truncate();
        DB::table('notifications')->truncate();
        DB::table('security_events')->truncate();
        DB::table('api_tokens')->truncate();
        DB::table('payments')->truncate();
        DB::table('rent_bills')->truncate();
        DB::table('utility_bills')->truncate();
        DB::table('tenancy_utilities')->truncate();
        DB::table('utility_types')->truncate();
        DB::table('tenant_identifications')->truncate();
        DB::table('tenancies')->truncate();
        DB::table('users')->truncate();
        DB::table('tenants')->truncate();
        DB::table('units')->truncate();
        DB::table('properties')->truncate();

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
}