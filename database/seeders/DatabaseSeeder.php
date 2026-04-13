<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * Single source of truth: DevelopmentSeeder handles all data including utility types.
     */
    public function run(): void
    {
        $this->call([
            DevelopmentSeeder::class,
        ]);
    }
}
