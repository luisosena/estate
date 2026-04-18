<?php

namespace Database\Factories;

use App\Models\Tenancy;
use App\Models\TenancyUtility;
use App\Models\UtilityType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TenancyUtility>
 */
class TenancyUtilityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tenancy_id' => Tenancy::factory(),
            'utility_type_id' => UtilityType::factory(),
            'amount' => $this->faker->randomFloat(2, 50, 500),
            'billing_cycle' => 'monthly',
            'status' => 'active',
        ];
    }
}
