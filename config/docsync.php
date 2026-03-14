<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Git Configuration
    |--------------------------------------------------------------------------
    */
    
    'git' => [
        'head' => env('DOCSYNC_GIT_HEAD', 'HEAD'),
        'paths' => [
            'app/Http/Controllers/',
            'app/Models/',
            'app/Services/',
            'database/migrations/',
            'config/',
            'routes/',
        ],
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Documentation File Mapping
    |--------------------------------------------------------------------------
    |
    | Maps code paths to their corresponding documentation files.
    |
    */
    
    'mapping' => [
        'app/Http/Controllers/Api/' => 'docs/API_REFERENCE.md',
        'app/Http/Controllers/Web/' => 'docs/API_REFERENCE.md',
        'app/Models/' => 'docs/DATABASE_SCHEMA.md',
        'database/migrations/' => 'docs/DATABASE_SCHEMA.md',
        'config/' => 'docs/CONFIGURATION.md',
        'routes/api.php' => 'docs/API_REFERENCE.md',
        'routes/web.php' => 'docs/API_REFERENCE.md',
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Documentation Files to Maintain
    |--------------------------------------------------------------------------
    |
    | List of documentation files that should be kept in sync.
    |
    */
    
    'docs' => [
        'docs/API_REFERENCE.md',
        'docs/DATABASE_SCHEMA.md',
        'docs/CONFIGURATION.md',
        'docs/BUSINESS_LOGIC.md',
        'docs/PROJECT_ARCHITECTURE.md',
        'docs/DEPENDENCY_TREE.md',
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Auto-sync Settings
    |--------------------------------------------------------------------------
    */
    
    'auto_sync' => [
        'enabled' => env('DOCSYNC_ENABLED', false),
        'on_commit' => env('DOCSYNC_ON_COMMIT', false),
        'on_merge' => env('DOCSYNC_ON_MERGE', true),
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Parsing Patterns
    |--------------------------------------------------------------------------
    */
    
    'patterns' => [
        'endpoints' => [
            'Route::(\w+)\([\'"]([^\'"]+)[\'"]',
            '\[([^\]]+)\]->(\w+)',
        ],
        
        'model_properties' => [
            'protected \$table\s*=\s*[\'"](\w+)[\'"]',
            'protected \$fillable\s*=\s*\[([^\]]+)\]',
            'protected \$hidden\s*=\s*\[([^\]]+)\]',
            'protected \$casts\s*=\s*\[([^\]]+)\]',
        ],
        
        'relationships' => [
            'public function (\w+)\(\)\s*->(\w+)\(',
            'public function (\w+)\(\)\s*->hasMany\(',
            'public function (\w+)\(\)\s*->belongsTo\(',
            'public function (\w+)\(\)\s*->hasOne\(',
            'public function (\w+)\(\)\s*->belongsToMany\(',
        ],
        
        'migration_columns' => [
            '\$table->(\w+)\([\'"](\w+)[\'"]',
            '\$table->(\w+)\([\'"](\w+)[\'"]\s*,\s*[\'"](\w+)[\'"]',
        ],
        
        'config_values' => [
            '[\'"](\w+)[\'"]\s*=>\s*([^\,]+)',
        ],
    ],
];
