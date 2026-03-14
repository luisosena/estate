# Documentation Sync System - Technical Specification

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Configuration](#configuration)
5. [Weaknesses and Solutions](#weaknesses-and-solutions)
6. [Usage](#usage)
7. [Troubleshooting](#troubleshooting)

---

## System Overview

The Documentation Sync System (DocSync) is an automated system designed to synchronize codebase changes with corresponding documentation. It detects changes in specified source files and automatically updates or generates documentation entries in Markdown format.

### Purpose

- Automatically track API endpoints from controllers
- Keep database schema documentation current with migrations
- Maintain configuration documentation
- Reduce manual documentation overhead

### Supported Documentation Types

| Source Type | Documentation Target |
|-------------|---------------------|
| API Controllers | `docs/API_REFERENCE.md` |
| Web Controllers | `docs/API_REFERENCE.md` |
| Models | `docs/DATABASE_SCHEMA.md` |
| Migrations | `docs/DATABASE_SCHEMA.md` |
| Config Files | `docs/CONFIGURATION.md` |
| Route Files | `docs/API_REFERENCE.md` |

---

## Architecture

### Data Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Git Diff       │───▶│  parseDiff()      │───▶│  analyzeChanges │───▶│  applyUpdates() │
│  Output         │    │  (extracts files) │    │  (determines    │    │  (writes to     │
│                 │    │                  │    │   changes)      │    │   markdown)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Components

#### 1. DocSyncService (`app/Services/DocSyncService.php`)

The main service class that handles all parsing and updating logic.

**Key Methods:**

| Method | Purpose |
|--------|---------|
| [`parseDiff()`](app/Services/DocSyncService.php:35) | Parse git diff output into structured changes |
| [`analyzeChanges()`](app/Services/DocSyncService.php:73) | Determine documentation updates needed |
| [`applyUpdates()`](app/Services/DocSyncService.php:125) | Apply changes to documentation files |
| [`analyzeDeletion()`](app/Services/DocSyncService.php:100) | Handle deleted files |
| [`analyzeModification()`](app/Services/DocSyncService.php:105) | Handle modified files |

#### 2. SyncDocumentation Command (`app/Console/Commands/SyncDocumentation.php`)

Artisan CLI command for running the sync process.

**Options:**

```
php artisan docsync 
    {--diff= : Specific git diff file to analyze}
    {--check : Check for discrepancies without updating}
    {--details : Show detailed output}
```

#### 3. Configuration (`config/docsync.php`)

Central configuration for path mappings, patterns, and auto-sync settings.

#### 4. GitHub Workflow (`.github/workflows/docs-sync.yml`)

CI/CD integration for automated documentation sync on PRs and merges.

#### 5. Pre-commit Hook (`hooks/pre-commit`)

Git hook for local documentation checking before commits.

---

## Configuration

### Path Mapping Configuration

Located in [`config/docsync.php`](config/docsync.php:31):

```php
'mapping' => [
    'app/Http/Controllers/Api/' => 'docs/API_REFERENCE.md',
    'app/Http/Controllers/Web/' => 'docs/API_REFERENCE.md',
    'app/Models/' => 'docs/DATABASE_SCHEMA.md',
    'database/migrations/' => 'docs/DATABASE_SCHEMA.md',
    'config/' => 'docs/CONFIGURATION.md',
    'routes/api.php' => 'docs/API_REFERENCE.md',
    'routes/web.php' => 'docs/API_REFERENCE.md',
],
```

### Auto-Sync Settings

```php
'auto_sync' => [
    'enabled' => env('DOCSYNC_ENABLED', false),
    'on_commit' => env('DOCSYNC_ON_COMMIT', false),
    'on_merge' => env('DOCSYNC_ON_MERGE', true),
],
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DOCSYNC_ENABLED` | Enable auto-sync | `false` |
| `DOCSYNC_ON_COMMIT` | Sync on every commit | `false` |
| `DOCSYNC_ON_MERGE` | Sync on merge to main/develop | `true` |
| `DOCSYNC_AUTO_ADD` | Auto-add docs to commit | `false` |

---

## Weaknesses and Solutions

### 🔴 Critical Weakness 1: Only Handles Additions

**Problem:** The system only processes new files and additions. When files are deleted or modified (removing code), the documentation is never updated.

**Current Behavior:**
```php
// Only processes 'added' status
if ($change['status'] === 'added' || !empty($change['additions'])) {
    // Process changes
}
```

**Impact:** 
- Deleted endpoints still appear in API documentation
- Removed database tables remain in schema docs
- Stale documentation that claims things exist when they don't

**Solution:** ✅ **IMPLEMENTED** - Added `analyzeDeletion()` and `analyzeModification()` methods:

```php
// Handle deletions - mark endpoints/tables/routes as deprecated/removed
if ($change['status'] === 'deleted') {
    return $this->analyzeDeletion($change, $docFile);
}

// Handle modifications - check for removed routes/methods
if ($change['status'] === 'modified') {
    $modificationUpdates = $this->analyzeModification($change, $docFile);
    $updates = array_merge($updates, $modificationUpdates);
}
```

---

### 🔴 Critical Weakness 2: Fragile Regex-Based "Parsing"

**Problem:** The system uses naive regex patterns that fail on many valid Laravel constructs.

**Current Patterns:**
```php
// This fails on: Route::get('/users', [UserController::class, 'index'])
// This fails on: Route::prefix('api')->group(...)
Route::(\w+)\([\'"]([^\'"]+)[\'\"]/
```

**What it misses:**
- Route groups: `Route::prefix('api')->group(...)`
- Controller actions: `Route::get('/users', [Controller::class, 'method'])`
- Array routes: `Route::get(['/users', '/posts'], ...)`
- Closure routes: `Route::get('/debug', function() {...})`

**Solution:** Replace with AST parsing or multi-pattern matching:

```php
// Better approach: Multiple fallback patterns
$patterns = [
    // Controller action pattern
    '/Route::(\w+)\(\s*[\'"]([^\'"]+)[\'"]\s*,\s*\[([^,]+),\s*[\'"](\w+)[\'"]/',
    // Simple route pattern  
    '/Route::(\w+)\(\s*[\'"]([^\'"]+)[\'"]/',
    // Named route pattern
    '/Route::(\w+)\(\s*[\'"]([^\'"]+)[\'"]\s*,\s*[\'"][^\'\"]*[\'"]/',
];

foreach ($patterns as $pattern) {
    if (preg_match_all($pattern, $additions, $matches, PREG_SET_ORDER)) {
        // Process matches
    }
}
```

**Recommendation:** For production, consider using a PHP AST parser like `nikic/php-parser` for accurate code analysis.

---

### 🔴 Critical Weakness 3: Zero Semantic Understanding

**Problem:** Generated documentation provides no actual useful information.

**Current Output:**
```markdown
#### POST /api/users
- **Controller**: UserController
- **Description**: Auto-generated from code change
```

**What it should include:**
- Parameter definitions and types
- Request/response schemas
- Authorization requirements
- Validation rules
- Example requests/responses

**Solution:** Enhanced extraction + manual annotation system:

```php
// Extract more context from code
$validationRules = $this->extractValidationRules($content);
$authMiddleware = $this->extractMiddleware($content);
$docBlocks = $this->extractDocBlocks($content);

// Generate richer documentation
$endpointDocs = [
    'method' => $method,
    'path' => $path,
    'controller' => $controller,
    'description' => $docBlocks['description'] ?? 'Auto-generated endpoint',
    'parameters' => $this->parseParameters($validationRules),
    'authorization' => $authMiddleware,
    'response' => $this->inferResponseType($content),
];
```

---

### 🟠 High Priority Weakness 4: Dangerous Auto-Add Behavior

**Problem:** Pre-commit hook silently stages documentation changes without explicit consent.

**Current Code (hooks/pre-commit:34):**
```bash
# Auto-adds without explicit consent
if ! git diff --quiet docs/; then
    git add docs/
fi
```

**Solution:** ✅ **IMPROVED** - Added explicit consent requirement:

```bash
# Only auto-add if explicitly enabled
if [ "$DOCSYNC_AUTO_ADD" = "true" ] && ! git diff --quiet docs/; then
    echo "📄 Documentation updates detected. Adding to commit..."
    git add docs/
fi
```

**Usage:**
```bash
# Enable auto-add (not recommended for production)
export DOCSYNC_AUTO_ADD=true
```

---

### 🟠 High Priority Weakness 5: GitHub Workflow Race Conditions

**Problem:** Uses `github.run_id` which changes on workflow re-runs, potentially creating duplicate PRs.

**Current Code (line 63, 74):**
```yaml
existing_pr=$(gh pr list --head docs/autosync-${{ github.run_id }} ...)
git checkout -b docs/autosync-${{ github.run_id }}
```

**Issue:** If workflow re-runs (due to failure or manual trigger), a new branch/PR is created.

**Solution:** Use a stable identifier:

```yaml
# Use workflow run number AND timestamp for stability
- name: Create branch with stable name
  run: |
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    BRANCH_NAME="docs/autosync-${{ github.run_number }}-${TIMESTAMP}"
    git checkout -b "$BRANCH_NAME"
```

Or better - check for existing changes and update the same PR:

```yaml
# Check if any docs-autosync PR already has changes from this commit
- name: Check for existing PR
  run: |
    # Use head ref that won't change on re-run
    BRANCH_NAME="docs/autosync-${{ github.event.pull_request.number }}"
    # Check and create/update PR accordingly
```

---

### 🟠 High Priority Weakness 6: Hook Installation Destroys Existing Hooks

**Problem:** `install-hooks.sh` overwrites any existing pre-commit hook.

**Current Code (line 17):**
```bash
cp "$SCRIPT_DIR/hooks/pre-commit" "$HOOKS_DIR/pre-commit"
```

**Issue:** If project already has hooks (linting, testing), they're lost.

**Solution:** Implement hook merging:

```bash
#!/bin/bash
# Merge with existing hooks instead of overwriting

PRE_COMMIT_HOOK="$HOOKS_DIR/pre-commit"
SOURCE_HOOK="$SCRIPT_DIR/hooks/pre-commit"

if [ -f "$PRE_COMMIT_HOOK" ]; then
    # Check if already contains doc sync
    if grep -q "docsync" "$PRE_COMMIT_HOOK"; then
        echo "✅ DocSync already installed in pre-commit hook"
    else
        # Backup existing
        cp "$PRE_COMMIT_HOOK" "$PRE_COMMIT_HOOK.bak"
        
        # Append doc sync call (assuming shell hook)
        echo "" >> "$PRE_COMMIT_HOOK"
        echo "# DocSync - Documentation Sync" >> "$PRE_COMMIT_HOOK"
        cat "$SOURCE_HOOK" >> "$PRE_COMMIT_HOOK"
        
        echo "✅ Merged with existing pre-commit hook (backup: pre-commit.bak)"
    fi
else
    cp "$SOURCE_HOOK" "$PRE_COMMIT_HOOK"
    chmod +x "$PRE_COMMIT_HOOK"
    echo "✅ Pre-commit hook installed"
fi
```

---

### 🟡 Medium Priority Weakness 7: No Test Coverage

**Problem:** Production system with zero tests. One bad regex could corrupt documentation files.

**Solution:** Add comprehensive test suite:

```php
// tests/Unit/DocSyncServiceTest.php

class DocSyncServiceTest extends TestCase
{
    protected DocSyncService $service;
    
    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new DocSyncService();
    }
    
    public function test_parseDiff_extracts_added_files(): void
    {
        $diff = file_get_contents(__DIR__ . '/fixtures/diff-added.txt');
        $changes = $this->service->parseDiff($diff);
        
        $this->assertCount(1, $changes);
        $this->assertEquals('added', $changes[0]['status']);
    }
    
    public function test_parseDiff_extracts_deleted_files(): void
    {
        $diff = file_get_contents(__DIR__ . '/fixtures/diff-deleted.txt');
        $changes = $this->service->parseDiff($diff);
        
        $this->assertCount(1, $changes);
        $this->assertEquals('deleted', $changes[0]['status']);
    }
    
    public function test_analyzeControllerChange_detects_routes(): void
    {
        $change = [
            'path' => 'app/Http/Controllers/Api/UserController.php',
            'status' => 'added',
            'additions' => ['Route::get("/users", [UserController::class, "index"]);'],
            'type' => 'controller',
        ];
        
        $updates = $this->service->analyzeChanges([$change]);
        
        $this->assertNotEmpty($updates);
        $this->assertEquals('new_endpoint', $updates[0]['change_type']);
    }
    
    public function test_applyUpdates_prevents_path_traversal(): void
    {
        $update = [
            'doc_file' => '../../secrets/config.php',
            'change_type' => 'test',
        ];
        
        $result = $this->service->applyUpdates([$update]);
        
        $this->assertFalse($result);
    }
}
```

---

### 🟡 Medium Priority Weakness 8: Configuration Mapping Gaps

**Problem:** Some paths in `git.paths` config aren't mapped to documentation.

**Current Gap:**
```php
// In config - tracked but not mapped:
'app/Services/' => // ❌ NO MAPPING

// Result: Changes here are silently ignored
```

**Solution:** Add complete mappings:

```php
'mapping' => [
    // ... existing mappings ...
    'app/Services/' => 'docs/BUSINESS_LOGIC.md',
    'app/Middleware/' => 'docs/API_REFERENCE.md',
    'app/Actions/' => 'docs/BUSINESS_LOGIC.md',
    'app/Console/Commands/' => 'docs/DEVELOPMENT_WORKFLOW.md',
],
```

---

### 🟡 Medium Priority Weakness 9: Poor Duplicate Detection

**Problem:** Case-sensitive string matching fails on case variations.

**Current Code:**
```php
// This will create duplicate entries for:
// GET /users
// get /users
if (str_contains($content, $endpointKey)) {
    return $content;
}
```

**Solution:** Normalize and use case-insensitive comparison:

```php
protected function endpointExists(string $content, string $method, string $path): bool
{
    // Normalize to uppercase for method comparison
    $normalizedMethod = strtoupper($method);
    $normalizedPath = strtolower($path);
    
    // Use regex for case-insensitive matching
    $pattern = '/^#{1,6}\s+' . preg_quote($normalizedMethod, '/') . '\s+' 
               . preg_quote($normalizedPath, '/') . '/mi';
    
    return (bool) preg_match($pattern, $content);
}
```

---

### 🟡 Medium Priority Weakness 10: Silent Failure on Errors

**Problem:** Exceptions are caught but user is not informed.

**Current Code:**
```php
} catch (\Exception $e) {
    report($e);
    return false;  // Silent failure
}
```

**Solution:** Add logging and user feedback:

```php
} catch (\Exception $e) {
    Log::error("DocSync failed to apply update", [
        'update' => $update,
        'error' => $e->getMessage(),
    ]);
    
    // Collect failures for reporting
    $this->failedUpdates[] = [
        'update' => $update,
        'error' => $e->getMessage(),
    ];
    
    return false;
}

// After applying updates, report failures
if (!empty($this->failedUpdates)) {
    $this->warn("Failed to apply " . count($this->failedUpdates) . " updates:");
    foreach ($this->failedUpdates as $failure) {
        $this->line("  - {$failure['update']['doc_file']}: {$failure['error']}");
    }
}
```

---

## Usage

### Manual Execution

```bash
# Check for documentation discrepancies
php artisan docs:sync --check

# Apply documentation updates (with confirmation)
php artisan docs:sync

# Apply with details
php artisan docs:sync --details

# Analyze specific diff file
php artisan docs:sync --diff=/path/to/diff.txt
```

### Pre-commit Hook

```bash
# Install hooks
./install-hooks.sh

# Run manually
php artisan docs:sync --check

# Enable auto-sync on commit
export DOCSYNC_ENABLED=true
```

### GitHub Actions

The workflow automatically runs on:
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`

When changes are detected, it creates a PR with documentation updates.

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "No parseable changes found" | No tracked files changed | Check file paths in config |
| Duplicates in documentation | Case variation or multiple matches | Run with `--check` first |
| "PHP not found" in hook | PHP not in PATH | Install PHP or set `PHP_BIN` explicitly |
| Hook doesn't run | Not installed | Run `./install-hooks.sh` |

### Debug Mode

Enable verbose logging:

```php
// In config/docsync.php
'debug' => env('DOCSYNC_DEBUG', true),
```

---

## Appendix: File Structure

```
.
├── app/
│   ├── Console/
│   │   └── Commands/
│   │       └── SyncDocumentation.php    # CLI command
│   └── Services/
│       └── DocSyncService.php           # Core service
├── config/
│   └── docsync.php                      # Configuration
├── hooks/
│   └── pre-commit                        # Git hook
├── .github/
│   └── workflows/
│       └── docs-sync.yml                # CI/CD workflow
└── install-hooks.sh                     # Installation script
```

---

## Future Improvements

1. **AST-based parsing** - Use nikic/php-parser for accurate code analysis
2. **Schema extraction** - Parse request/response types from code
3. **Manual annotations** - Support `@doc` annotations in code
4. **Rollback capability** - Undo applied changes
5. **Conflict resolution** - Handle merge conflicts in docs
6. **Multiple output formats** - Support OpenAPI, Swagger

---

*Last Updated: 2026-03-14*
