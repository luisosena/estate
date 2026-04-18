<?php

namespace Database\Factories;

use App\Models\UtilityType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UtilityType>
 */
class UtilityTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->randomElement(['Water', 'Electricity', 'Internet', 'Garbage']),
            'description' => $this->faker->sentence(),
            'unit' => $this->faker->randomElement(['Units', 'm3', 'kWh', 'Month']),
            'is_metered' => false,
            'is_active' => true,
        ];
    }
}
