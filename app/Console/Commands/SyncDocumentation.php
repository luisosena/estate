<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;
use App\Services\DocSyncService;

class SyncDocumentation extends Command
{
    protected $signature = 'docsync {--diff= : Specific git diff to analyze} {--check : Check for discrepancies without updating} {--details : Show detailed output}';

    protected $description = 'Synchronize documentation with codebase changes';

    protected DocSyncService $docSync;

    public function __construct(DocSyncService $docSync)
    {
        parent::__construct();
        $this->docSync = $docSync;
    }

    public function handle(): int
    {
        $diff = $this->option('diff');
        $checkOnly = $this->option('check');
        $details = $this->option('details');

        $this->info('🔍 Analyzing codebase changes...');

        // Get the diff to analyze
        if ($diff) {
            $diffOutput = file_get_contents($diff);
        } else {
            $diffOutput = $this->getGitDiff();
        }

        $this->info('Diff length: ' . strlen($diffOutput));
        
        if (empty($diffOutput)) {
            $this->warn('No changes found to analyze.');
            return self::SUCCESS;
        }

        // Parse the diff and extract changed files
        $changes = $this->docSync->parseDiff($diffOutput);

        if (empty($changes)) {
            $this->warn('No parseable changes found.');
            return self::SUCCESS;
        }

        $this->info("Found " . count($changes) . " changed files.");

        // Analyze each change and determine documentation updates needed
        $updates = $this->docSync->analyzeChanges($changes);

        if (empty($updates)) {
            $this->info('✅ No documentation updates needed.');
            return self::SUCCESS;
        }

        $this->warn("Found " . count($updates) . " documentation updates needed:");

        // Display the updates needed
        foreach ($updates as $update) {
            $this->line("  - {$update['doc_file']}: {$update['description']}");
            
            if ($details) {
                $this->line("    Change: {$update['change_summary']}");
            }
        }

        if ($checkOnly) {
            $this->info('Running in check mode - no changes made.');
            return self::SUCCESS;
        }

        // Apply the updates (skip confirmation in CI or when --check is used)
        $autoApply = !$checkOnly && !getenv('CI');
        
        if ($autoApply && $this->confirm('Apply these documentation updates?')) {
            $applied = $this->docSync->applyUpdates($updates);
            
            $this->info("✅ Applied {$applied} documentation updates.");
            return self::SUCCESS;
        }

        $this->info('Cancelled.');
        return self::SUCCESS;
    }

    private function getGitDiff(): string
    {
        try {
            // Get git diff using Laravel's Process facade
            $result = Process::run('git diff HEAD --no-color');
            
            if ($result->successful()) {
                return $result->output();
            }
            
            // Fallback: try with different approach
            $result = Process::run('git diff HEAD~1 HEAD --no-color');
            
            if ($result->successful()) {
                return $result->output();
            }
            
            // Provide helpful error message with stderr output
            $errorOutput = $result->error();
            $this->error('Unable to retrieve git diff.');
            if (!empty($errorOutput)) {
                $this->line("Error: {$errorOutput}");
            }
            $this->line('Consider passing a diff file with --diff option.');
        } catch (\Exception $e) {
            $this->error('Failed to run git diff: ' . $e->getMessage());
        }
        
        return '';
    }
}
