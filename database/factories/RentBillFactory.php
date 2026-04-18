<?php

namespace Database\Factories;

use App\Models\RentBill;
use App\Models\Tenancy;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RentBill>
 */
class RentBillFactory extends Factory
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
            'billing_month' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'amount_due' => $this->faker->randomFloat(2, 500, 5000),
            'amount_paid' => 0,
            'due_date' => $this->faker->dateTimeBetween('now', '+1 month'),
            'status' => 'pending',
        ];
    }
}
