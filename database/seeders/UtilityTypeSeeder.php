<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UtilityTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Water',       'unit' => 'cubic metres', 'is_metered' => true,  'description' => 'Water consumption billed by meter reading'],
            ['name' => 'Electricity', 'unit' => 'kWh',          'is_metered' => true,  'description' => 'Electricity consumption billed by meter reading'],
            ['name' => 'Gas',         'unit' => 'cubic metres', 'is_metered' => true,  'description' => 'Gas consumption billed by meter reading'],
            ['name' => 'Internet',    'unit' => 'flat rate',    'is_metered' => false, 'description' => 'Fixed monthly internet subscription'],
            ['name' => 'Security',    'unit' => 'flat rate',    'is_metered' => false, 'description' => 'Monthly security/guard service fee'],
            ['name' => 'Janitor',     'unit' => 'flat rate',    'is_metered' => false, 'description' => 'Monthly cleaning and maintenance fee'],
            ['name' => 'Garbage',     'unit' => 'flat rate',    'is_metered' => false, 'description' => 'Monthly refuse collection fee'],
            ['name' => 'Parking',     'unit' => 'flat rate',    'is_metered' => false, 'description' => 'Monthly parking fee'],
        ];

        foreach ($types as $type) {
            DB::table('utility_types')->insertOrIgnore(array_merge($type, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
