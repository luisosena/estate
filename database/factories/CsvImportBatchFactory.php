<?php

namespace Database\Factories;

use App\Enums\CsvImportStatus;
use App\Models\CsvImportBatch;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CsvImportBatch>
 */
class CsvImportBatchFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'original_filename' => $this->faker->word().'.csv',
            'stored_path' => 'csv-imports/'.$this->faker->uuid().'/'.$this->faker->word().'.csv',
            'status' => CsvImportStatus::Pending,
            'total_rows' => 0,
            'processed_rows' => 0,
            'created_rows' => 0,
            'failed_rows' => 0,
            'row_errors' => null,
            'import_summary' => null,
            'completed_at' => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => CsvImportStatus::Completed,
            'total_rows' => 3,
            'processed_rows' => 3,
            'created_rows' => 3,
            'failed_rows' => 0,
            'import_summary' => [
                'properties' => 1,
                'units' => 3,
                'tenants' => 3,
                'tenancies' => 3,
                'users' => 3,
            ],
            'completed_at' => now(),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => CsvImportStatus::Failed,
            'total_rows' => 2,
            'failed_rows' => 2,
            'row_errors' => [
                ['row' => 2, 'field' => 'tenant_phone', 'message' => 'Phone number is invalid.'],
            ],
        ]);
    }

    public function partial(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => CsvImportStatus::Completed,
            'total_rows' => 3,
            'processed_rows' => 3,
            'created_rows' => 2,
            'failed_rows' => 1,
            'row_errors' => [
                ['row' => 2, 'field' => 'unit_code', 'message' => 'Unit B1 in Sunrise Apts already has an active tenant.'],
            ],
            'import_summary' => [
                'properties' => 1,
                'units' => 2,
                'tenants' => 2,
                'tenancies' => 2,
                'users' => 2,
            ],
            'completed_at' => now(),
        ]);
    }
}
