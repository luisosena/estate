<?php

namespace Database\Factories;

use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Tenancy>
 */
class TenancyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'unit_id' => Unit::factory(),
            'move_in_date' => $this->faker->date(),
            'monthly_rent' => $this->faker->randomFloat(2, 500, 5000),
            'security_deposit' => $this->faker->randomFloat(2, 500, 5000),
            'status' => 'active',
            'rent_due_day' => $this->faker->numberBetween(1, 28),
        ];
    }
}
