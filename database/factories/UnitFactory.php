<?php

namespace Database\Factories;

use App\Models\Property;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Unit>
 */
class UnitFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'property_id' => Property::factory(),
            'unit_code' => 'U-'.strtoupper($this->faker->unique()->bothify('###??')),
            'unit_name' => $this->faker->numerify('Unit ###'),
            'status' => 'available',
        ];
    }
}
