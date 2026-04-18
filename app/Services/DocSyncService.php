<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class DocSyncService
{
    protected array $parsers = [];

    protected array $updaters = [];

    protected array $pathToDocMap = [];

    public function __construct()
    {
        // Load path mapping from config, with fallback defaults
        $this->pathToDocMap = config('docsync.mapping', [
            'app/Http/Controllers/Api/' => 'docs/API_REFERENCE.md',
            'app/Models/' => 'docs/DATABASE_SCHEMA.md',
            'database/migrations/' => 'docs/DATABASE_SCHEMA.md',
            'config/' => 'docs/CONFIGURATION.md',
            'routes/' => 'docs/API_REFERENCE.md',
        ]);

        // Set PCRE backtrack limit to prevent DoS from large diffs
        ini_set('pcre.backtrack_limit', 1000000);

        $this->registerUpdaters();
    }

    /**
     * Parse git diff output into structured changes
     */
    public function parseDiff(string $diffOutput): array
    {
        $changes = [];

        // Use a simpler approach - split by double newlines after diff --git
        $pattern = '/diff --git a\/(.+?) b\/(.+?)(?=\ndiff --git|$)/s';

        if (preg_match_all($pattern, $diffOutput, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $filePath = $match[1];
                $fileDiff = $match[0];

                // Skip if not a relevant file
                if (! $this->isRelevantFile($filePath)) {
                    continue;
                }

                $status = $this->getChangeStatus($fileDiff);
                $additions = $this->extractAdditions($fileDiff);
                $deletions = $this->extractDeletions($fileDiff);

                $changes[] = [
                    'path' => $filePath,
                    'status' => $status,
                    'additions' => $additions,
                    'deletions' => $deletions,
                    'type' => $this->determineFileType($filePath),
                    'content' => $this->extractNewContent($fileDiff),
                ];
            }
        }

        return $changes;
    }

    /**
     * Analyze changes and determine what documentation updates are needed
     */
    public function analyzeChanges(array $changes): array
    {
        $updates = [];

        foreach ($changes as $change) {
            $fileUpdates = $this->analyzeSingleChange($change);
            $updates = array_merge($updates, $fileUpdates);
        }

        return $updates;
    }

    /**
     * Analyze a single change and determine documentation updates
     */
    protected function analyzeSingleChange(array $change): array
    {
        $updates = [];
        $path = $change['path'];

        // Map to documentation file
        $docFile = $this->mapToDocumentation($path);

        if (! $docFile) {
            return $updates;
        }

        // Handle deletions - mark endpoints/tables/routes as deprecated/removed
        if ($change['status'] === 'deleted') {
            return $this->analyzeDeletion($change, $docFile);
        }

        // Handle modifications - check for both additions and deletions in changed files
        if ($change['status'] === 'modified') {
            $modificationUpdates = $this->analyzeModification($change, $docFile);
            $updates = array_merge($updates, $modificationUpdates);
        }

        // Determine what kind of updates are needed based on the change
        // Only process additions for new files or additions within modified files
        if ($change['status'] === 'added' || ! empty($change['additions'])) {
            switch ($change['type']) {
                case 'controller':
                    $updates = array_merge($updates, $this->analyzeControllerChange($change, $docFile));
                    break;
                case 'model':
                    $updates = array_merge($updates, $this->analyzeModelChange($change, $docFile));
                    break;
                case 'migration':
                    $updates = array_merge($updates, $this->analyzeMigrationChange($change, $docFile));
                    break;
                case 'config':
                    $updates = array_merge($updates, $this->analyzeConfigChange($change, $docFile));
                    break;
                case 'route':
                    $updates = array_merge($updates, $this->analyzeRouteChange($change, $docFile));
                    break;
            }
        }

        return $updates;
    }

    protected function analyzeDeletion(array $change, string $docFile): array
    {
        $updates = [];
        $path = $change['path'];
        $fileName = basename($path, '.php');

        switch ($change['type']) {
            case 'controller':
                $updates[] = [
                    'doc_file' => $docFile,
                    'change_type' => 'endpoint_removed',
                    'controller' => $fileName,
                    'description' => "Removed controller: {$fileName}",
                    'change_summary' => "Deleted {$path}",
                ];
                break;
            case 'model':
                $updates[] = [
                    'doc_file' => $docFile,
                    'change_type' => 'model_removed',
                    'model_name' => $fileName,
                    'description' => "Removed model: {$fileName}",
                    'change_summary' => "Deleted {$path}",
                ];
                break;
            case 'migration':
                // Extract table name from migration filename
                if (preg_match('/(?:create_|drop_|_table)([a-z_]+)/', $fileName, $matches)) {
                    $updates[] = [
                        'doc_file' => $docFile,
                        'change_type' => 'table_removed',
                        'table_name' => $matches[1],
                        'migration_file' => $fileName,
                        'description' => "Removed table: {$matches[1]}",
                        'change_summary' => "Deleted migration {$fileName}",
                    ];
                }
                break;
            case 'config':
                $updates[] = [
                    'doc_file' => $docFile,
                    'change_type' => 'config_removed',
                    'config_file' => $fileName,
                    'description' => "Removed config: {$fileName}",
                    'change_summary' => "Deleted {$path}",
                ];
                break;
        }

        return $updates;
    }

    protected function analyzeModification(array $change, string $docFile): array
    {
        $updates = [];

        if (! empty($change['deletions'])) {
            $deletions = implode("\n", $change['deletions']);

            // Look for removed route definitions
            if (preg_match_all('/Route::(\w+)\(.*?[\'"]([^\'"]+)[\'"]/', $deletions, $matches, PREG_SET_ORDER)) {
                foreach ($matches as $match) {
                    $updates[] = [
                        'doc_file' => $docFile,
                        'change_type' => 'endpoint_removed',
                        'method' => $match[1],
                        'path' => $match[2],
                        'description' => "Removed endpoint: {$match[1]} {$match[2]}",
                        'change_summary' => "Removed route in {$change['path']}",
                    ];
                }
            }

            // Look for removed model relationships
            if ($change['type'] === 'model' && preg_match_all('/public function (\w+)\(\)/', $deletions, $matches, PREG_SET_ORDER)) {
                foreach ($matches as $match) {
                    $updates[] = [
                        'doc_file' => $docFile,
                        'change_type' => 'relationship_removed',
                        'model' => basename($change['path'], '.php'),
                        'method_name' => $match[1],
                        'description' => "Removed relationship: {$match[1]}",
                        'change_summary' => "Removed method in {$change['path']}",
                    ];
                }
            }
        }

        return $updates;
    }

    /**
     * Apply documentation updates
     */
    public function applyUpdates(array $updates): int
    {
        $applied = 0;

        foreach ($updates as $update) {
            if ($this->applySingleUpdate($update)) {
                $applied++;
            }
        }

        return $applied;
    }

    /**
     * Apply a single documentation update
     */
    protected function applySingleUpdate(array $update): bool
    {
        $docFile = base_path($update['doc_file']);

        // Validate path stays within docs/ directory to prevent path traversal
        $realPath = realpath($docFile);
        $docsPath = realpath(base_path('docs/'));

        if (! $realPath || ! $docsPath || ! str_starts_with($realPath, $docsPath.DIRECTORY_SEPARATOR)) {
            Log::warning("Path traversal attempt blocked: {$update['doc_file']}");

            return false;
        }

        if (! File::exists($docFile)) {
            return false;
        }

        try {
            $content = File::get($docFile);

            // Use the appropriate updater
            $updater = $this->getUpdater($update['doc_file']);

            if (! $updater) {
                Log::warning("No updater registered for doc file: {$update['doc_file']}");

                return false;
            }

            if (! method_exists($this, $updater)) {
                Log::warning("Updater method '{$updater}' does not exist for doc file: {$update['doc_file']}");

                return false;
            }

            $newContent = $this->$updater($content, $update);

            if ($newContent !== $content) {
                File::put($docFile, $newContent);

                return true;
            }

            return false;
        } catch (\Exception $e) {
            report($e);

            return false;
        }
    }

    // ==================== UPDATERS ====================

    protected function registerUpdaters(): void
    {
        $this->updaters = [
            'docs/API_REFERENCE.md' => 'updateApiReference',
            'docs/DATABASE_SCHEMA.md' => 'updateDatabaseSchema',
            'docs/CONFIGURATION.md' => 'updateConfiguration',
        ];
    }

    protected function getUpdater(string $docFile): ?string
    {
        return $this->updaters[$docFile] ?? null;
    }

    /**
     * Update API Reference documentation
     */
    protected function updateApiReference(string $content, array $update): string
    {
        $newEndpoint = $this->formatNewEndpoint($update);
        $endpointKey = "{$newEndpoint['method']} {$newEndpoint['path']}";

        // Check if this endpoint already exists in the content
        if (str_contains($content, $endpointKey)) {
            return $content;  // Skip duplicate
        }

        // Find the appropriate section to append to (or create one)
        $section = "### New Endpoints\n\n";

        if (str_contains($content, $section)) {
            // Append to existing "New Endpoints" section
            $pattern = '/(### New Endpoints\n\n)/';
            $replacement = '$1'.$this->formatEndpointEntry($newEndpoint)."\n";

            return preg_replace($pattern, $replacement, $content, 1);
        } else {
            // Add new section at the end
            return $content."\n".$section.$this->formatEndpointEntry($newEndpoint)."\n";
        }
    }

    /**
     * Format a single endpoint entry
     */
    protected function formatEndpointEntry(array $endpoint): string
    {
        return "#### {$endpoint['method']} {$endpoint['path']}\n"
             ."- **Controller**: {$endpoint['controller']}\n"
             ."- **Description**: Auto-generated from code change\n";
    }

    /**
     * Update Database Schema documentation
     */
    protected function updateDatabaseSchema(string $content, array $update): string
    {
        if ($update['change_type'] === 'new_table') {
            return $this->addNewTable($content, $update);
        } elseif ($update['change_type'] === 'column_change') {
            return $this->updateTableColumn($content, $update);
        }

        return $content;
    }

    /**
     * Update Configuration documentation
     */
    protected function updateConfiguration(string $content, array $update): string
    {
        $varName = $update['variable_name'] ?? null;

        if ($varName && preg_match("/\|\s*{$varName}\s*\|/", $content)) {
            $content = preg_replace(
                "/(\|\s*{$varName}\s*\|)[^\n]*(\n)/",
                "{$update['formatted_row']}$2",
                $content
            );
        } else {
            $content = preg_replace(
                '/(\|---+\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|)\s*\n\n/',
                "$1\n{$update['formatted_row']}\n\n/",
                $content
            );
        }

        return $content;
    }

    // ==================== HELPERS ====================

    protected function isRelevantFile(string $path): bool
    {
        $relevantPatterns = [
            'app/Http/Controllers/',
            'app/Models/',
            'database/migrations/',
            'config/',
            'routes/',
        ];

        foreach ($relevantPatterns as $pattern) {
            if (Str::startsWith($path, $pattern)) {
                return true;
            }
        }

        return false;
    }

    protected function getChangeStatus(string $fileDiff): string
    {
        if (preg_match('/^new file mode/m', $fileDiff)) {
            return 'added';
        }
        if (preg_match('/^deleted file mode/m', $fileDiff)) {
            return 'deleted';
        }

        return 'modified';
    }

    protected function determineFileType(string $path): string
    {
        if (Str::contains($path, 'Controllers')) {
            return 'controller';
        }
        if (Str::contains($path, 'Models/')) {
            return 'model';
        }
        if (Str::contains($path, 'migrations')) {
            return 'migration';
        }
        if (Str::contains($path, 'config/')) {
            return 'config';
        }
        if (Str::contains($path, 'routes/')) {
            return 'route';
        }

        return 'unknown';
    }

    protected function mapToDocumentation(string $path): ?string
    {
        foreach ($this->pathToDocMap as $codePath => $docPath) {
            if (Str::startsWith($path, $codePath)) {
                return $docPath;
            }
        }

        return null;
    }

    protected function extractAdditions(string $diff): array
    {
        $additions = [];
        preg_match_all('/^\+([^+].*)$/m', $diff, $matches);

        foreach ($matches[1] as $line) {
            $additions[] = $line;
        }

        return $additions;
    }

    protected function extractDeletions(string $diff): array
    {
        $deletions = [];
        preg_match_all('/^-([^-].*)$/m', $diff, $matches);

        foreach ($matches[1] as $line) {
            $deletions[] = $line;
        }

        return $deletions;
    }

    protected function extractNewContent(string $diff): string
    {
        // Unified diff format: content appears after @@ lines as lines starting with +
        // Match from @@ to end of file to get added content
        if (preg_match_all('/^\+([^\+].*)$/m', $diff, $matches)) {
            return implode("\n", $matches[0]);
        }

        return '';
    }

    // ==================== CHANGE ANALYSIS ====================

    protected function analyzeControllerChange(array $change, string $docFile): array
    {
        $updates = [];

        if ($change['status'] === 'added' || ! empty($change['additions'])) {
            $additions = implode("\n", $change['additions']);

            // Look for route definitions
            if (preg_match_all('/Route::(\w+)\([\'"]([^\'"]+)[\'"]/', $additions, $matches, PREG_SET_ORDER)) {
                foreach ($matches as $match) {
                    $updates[] = [
                        'doc_file' => $docFile,
                        'change_type' => 'new_endpoint',
                        'method' => $match[1],
                        'path' => $match[2],
                        'controller' => basename($change['path'], '.php'),
                        'description' => "New API endpoint: {$match[1]} {$match[2]}",
                        'change_summary' => "Added endpoint in {$change['path']}",
                    ];
                }
            }

            // Look for new methods
            if (preg_match_all('/public function (\w+)\(/', $additions, $matches, PREG_SET_ORDER)) {
                foreach ($matches as $match) {
                    $updates[] = [
                        'doc_file' => $docFile,
                        'change_type' => 'new_method',
                        'method_name' => $match[1],
                        'controller' => basename($change['path'], '.php'),
                        'description' => "New controller method: {$match[1]}",
                        'change_summary' => "Added method in {$change['path']}",
                    ];
                }
            }
        }

        return $updates;
    }

    protected function analyzeModelChange(array $change, string $docFile): array
    {
        $updates = [];

        if ($change['status'] === 'added') {
            $modelName = basename($change['path'], '.php');

            $content = $change['content'];
            $tableName = null;
            if (preg_match('/protected \$table\s*=\s*[\'"](\w+)[\'"]/', $content, $match)) {
                $tableName = $match[1];
            }

            $fillable = [];
            if (preg_match('/protected \$fillable\s*=\s*\[([^\]]+)\]/', $content, $match)) {
                preg_match_all('/[\'"]([^\'"]+)[\'"]/', $match[1], $fillableMatches);
                $fillable = $fillableMatches[1];
            }

            $relationships = [];
            if (preg_match_all('/public function (\w+)\(\)\s*->(\w+)\(/', $content, $matches, PREG_SET_ORDER)) {
                foreach ($matches as $match) {
                    $relationships[] = "{$match[1]} ({$match[2]})";
                }
            }

            $updates[] = [
                'doc_file' => $docFile,
                'change_type' => 'new_model',
                'model_name' => $modelName,
                'table_name' => $tableName ?? Str::snake(Str::plural($modelName)),
                'fillable' => $fillable,
                'relationships' => $relationships,
                'description' => "New model: {$modelName}",
                'change_summary' => "Added model {$modelName}",
            ];
        }

        return $updates;
    }

    protected function analyzeMigrationChange(array $change, string $docFile): array
    {
        $updates = [];

        $fileName = basename($change['path']);

        if (preg_match('/create_(\w+)_table|add_\w+_to_(\w+)_table/', $fileName, $matches)) {
            $tableName = $matches[1] ?: $matches[2];
            $changeType = Str::contains($fileName, 'create_') ? 'new_table' : 'column_change';

            $columns = [];
            if (! empty($change['additions'])) {
                $additions = implode("\n", $change['additions']);

                if (preg_match_all('/\$table->(\w+)\([\'"](\w+)[\'"]/', $additions, $colMatches, PREG_SET_ORDER)) {
                    foreach ($colMatches as $col) {
                        $columns[] = [
                            'type' => $col[1],
                            'name' => $col[2],
                        ];
                    }
                }
            }

            $updates[] = [
                'doc_file' => $docFile,
                'change_type' => $changeType,
                'table_name' => $tableName,
                'columns' => $columns,
                'migration_file' => $fileName,
                'description' => "Migration: {$fileName}",
                'change_summary' => "Database migration {$fileName}",
            ];
        }

        return $updates;
    }

    protected function analyzeConfigChange(array $change, string $docFile): array
    {
        $updates = [];

        if (! empty($change['additions'])) {
            $additions = implode("\n", $change['additions']);

            if (preg_match_all('/[\'"](\w+)[\'"]\s*=>\s*([^\,]+)/', $additions, $matches, PREG_SET_ORDER)) {
                foreach ($matches as $match) {
                    $configFile = basename($change['path'], '.php');

                    $updates[] = [
                        'doc_file' => $docFile,
                        'change_type' => 'config_value',
                        'config_file' => $configFile,
                        'variable_name' => $match[1],
                        'value' => trim($match[2]),
                        'formatted_row' => "| {$configFile} | {$match[1]} | ".trim($match[2]).' |',
                        'description' => "New config: {$configFile}.{$match[1]}",
                        'change_summary' => "Config change in {$change['path']}",
                    ];
                }
            }
        }

        return $updates;
    }

    protected function analyzeRouteChange(array $change, string $docFile): array
    {
        $updates = [];

        if (! empty($change['additions'])) {
            $additions = implode("\n", $change['additions']);

            if (preg_match_all('/Route::(\w+)\([\'"]([^\'"]+)[\'"]\s*,?\s*[\'"]?([^\'"]*)[\'"]?/', $additions, $matches, PREG_SET_ORDER)) {
                foreach ($matches as $match) {
                    $updates[] = [
                        'doc_file' => $docFile,
                        'change_type' => 'new_route',
                        'method' => strtoupper($match[1]),
                        'path' => $match[2],
                        'name' => $match[3] ?? null,
                        'description' => "New route: {$match[1]} {$match[2]}",
                        'change_summary' => "Route added in {$change['path']}",
                    ];
                }
            }
        }

        return $updates;
    }

    // ==================== CONTENT REBUILDERS ====================

    protected function formatNewEndpoint(array $update): array
    {
        return [
            'method' => $update['method'] ?? 'GET',
            'path' => $update['path'] ?? '/',
            'controller' => $update['controller'] ?? null,
        ];
    }

    protected function addNewTable(string $content, array $update): string
    {
        $tableName = $update['table_name'];
        $columns = $update['columns'] ?? [];

        // Check if table already exists in documentation
        if (str_contains($content, "### {$tableName}")) {
            return $content;  // Skip duplicate
        }

        $tableMarkdown = "\n### {$tableName}\n\n";
        $tableMarkdown .= "**Purpose**: (Auto-generated from migration)\n\n";
        $tableMarkdown .= "| Column | Type | Constraints | Description |\n";
        $tableMarkdown .= "|--------|------|-------------|-------------|\n";

        foreach ($columns as $col) {
            $tableMarkdown .= "| {$col['name']} | {$col['type']} | | |\n";
        }

        return $content.$tableMarkdown;
    }

    protected function updateTableColumn(string $content, array $update): string
    {
        $tableName = $update['table_name'];
        $note = "\n> Note: Table {$tableName} was modified. See migration: {$update['migration_file']}\n";

        return $content.$note;
    }
}
