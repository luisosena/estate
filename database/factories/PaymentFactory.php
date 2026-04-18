<?php

namespace Database\Factories;

use App\Models\Payment;
use App\Models\Tenancy;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
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
            'tenancy_id' => Tenancy::factory(),
            'amount' => $this->faker->randomFloat(2, 500, 5000),
            'payment_type' => 'rent',
            'payment_method' => $this->faker->randomElement(['mpesa', 'bank_transfer', 'cash', 'cheque']),
            'status' => 'paid',
            'paid_at' => now(),
            'reference_number' => strtoupper($this->faker->unique()->bothify('??##########')),
        ];
    }
}
