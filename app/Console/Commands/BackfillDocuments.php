<?php

namespace App\Console\Commands;

use App\Models\Document;
use App\Models\Tenancy;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BackfillDocuments extends Command
{
    protected $signature = 'documents:backfill {--dry-run : Preview without migrating}';

    protected $description = 'Backfill existing tenancy_agreement_path records into the documents table';

    public function handle(): int
    {
        $this->info('Starting document backfill...');

        $tenancies = Tenancy::with('tenant')
            ->whereNotNull('tenancy_agreement_path')
            ->where('tenancy_agreement_path', '!=', '')
            ->get();

        $count = $tenancies->count();

        if ($count === 0) {
            $this->info('No tenancies with agreement paths found. Nothing to backfill.');
            return Command::SUCCESS;
        }

        $this->info("Found {$count} tenancies with agreement paths.");

        if ($this->option('dry-run')) {
            $this->warn('DRY RUN — no changes will be made.');
            $this->table(
                ['Tenancy ID', 'Tenant', 'Agreement Path'],
                $tenancies->map(fn ($t) => [
                    $t->id,
                    $t->tenant?->full_name ?? 'N/A',
                    $t->tenancy_agreement_path,
                ])->toArray()
            );
            return Command::SUCCESS;
        }

        $bar = $this->output->createProgressBar($count);
        $bar->start();

        $created = 0;
        $skipped = 0;
        $errors = 0;

        foreach ($tenancies as $tenancy) {
            try {
                // Check if a document already exists for this tenancy
                $existing = Document::where('documentable_type', Tenancy::class)
                    ->where('documentable_id', $tenancy->id)
                    ->where('category', 'tenancy_agreement')
                    ->first();

                if ($existing) {
                    $skipped++;
                    $bar->advance();
                    continue;
                }

                $oldPath = $tenancy->tenancy_agreement_path;
                $disk = Storage::disk('documents');

                // Check if old file exists
                if ($disk->exists($oldPath)) {
                    // Generate new path structure
                    $extension = pathinfo($oldPath, PATHINFO_EXTENSION) ?: 'pdf';
                    $uuid = Str::uuid()->toString();
                    $newPath = sprintf(
                        'tenancy_agreement/Tenancy/%s/%s.%s',
                        $tenancy->id,
                        $uuid,
                        $extension
                    );

                    // Copy file to new location
                    $disk->copy($oldPath, $newPath);
                } else {
                    $newPath = $oldPath;
                }

                Document::create([
                    'user_id' => $tenancy->tenant?->user_id,
                    'documentable_type' => Tenancy::class,
                    'documentable_id' => $tenancy->id,
                    'file_path' => $newPath,
                    'file_name' => basename($oldPath),
                    'file_type' => 'application/pdf',
                    'file_size' => $disk->exists($newPath) ? $disk->size($newPath) : 0,
                    'category' => 'tenancy_agreement',
                    'uploaded_at' => $tenancy->created_at ?? now(),
                ]);

                $created++;
            } catch (\Exception $e) {
                $errors++;
                $this->error("Failed for tenancy {$tenancy->id}: {$e->getMessage()}");
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("Backfill complete:");
        $this->table(
            ['Created', 'Skipped', 'Errors'],
            [[$created, $skipped, $errors]]
        );

        return Command::SUCCESS;
    }
}
