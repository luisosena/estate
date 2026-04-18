<?php

namespace Database\Factories;

use App\Models\TenancyUtility;
use App\Models\UtilityBill;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UtilityBill>
 */
class UtilityBillFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tenancy_utility_id' => TenancyUtility::factory(),
            'billing_month' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'units_consumed' => $this->faker->randomFloat(3, 10, 500),
            'amount_due' => $this->faker->randomFloat(2, 50, 500),
            'amount_paid' => 0,
            'due_date' => $this->faker->dateTimeBetween('now', '+1 month'),
            'status' => 'pending',
        ];
    }
}
