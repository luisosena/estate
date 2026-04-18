<?php

namespace Database\Factories;

use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Property>
 */
class PropertyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'owner_id' => User::factory(),
            'name' => $this->faker->company().' Estate',
            'total_units' => $this->faker->numberBetween(1, 20),
            'address' => $this->faker->address(),
            'city' => $this->faker->city(),
            'state' => $this->faker->state(),
            'postal_code' => $this->faker->postcode(),
            'country' => $this->faker->country(),
            'property_type' => $this->faker->randomElement(['Apartment', 'Bungalow', 'Commercial', 'Residential']),
            'status' => 'active',
            'amenities' => ['Parking', 'Security', 'Wi-Fi'],
            'policies' => ['No Smoking', 'No Pets'],
        ];
    }
}
