<?php

namespace Database\Factories;

use App\Models\Document;
use App\Models\Tenancy;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Document>
 */
class DocumentFactory extends Factory
{
    protected $model = Document::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'documentable_type' => Tenancy::class,
            'documentable_id' => Tenancy::factory(),
            'file_path' => 'tenancy_agreement/Tenancy/'.$this->faker->numberBetween(1, 100).'/'.$this->faker->uuid().'.pdf',
            'file_name' => $this->faker->word().'_'.$this->faker->unique()->numberBetween(1000, 9999).'.pdf',
            'file_type' => 'application/pdf',
            'file_size' => $this->faker->numberBetween(10000, 5000000),
            'category' => 'tenancy_agreement',
            'uploaded_at' => fn () => now(),
        ];
    }

    public function receipt(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'receipt',
            'file_name' => $this->faker->word().'_receipt_'.$this->faker->unique()->numberBetween(1000, 9999).'.pdf',
            'file_type' => 'application/pdf',
        ]);
    }

    public function inspectionPhoto(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'inspection_photo',
            'file_name' => $this->faker->word().'_inspection_'.$this->faker->unique()->numberBetween(1000, 9999).'.jpg',
            'file_type' => 'image/jpeg',
        ]);
    }

    public function idDocument(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'id_document',
            'file_name' => $this->faker->word().'_id_'.$this->faker->unique()->numberBetween(1000, 9999).'.pdf',
            'file_type' => 'application/pdf',
        ]);
    }
}
