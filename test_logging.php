<?php

require_once __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing Logging System\n";
echo "====================\n\n";

// Test logging
\Log::info('Test log entry', ['test' => true]);
echo "✓ Log entry created\n";

// Check if we can read recent logs
$logFile = storage_path('logs/laravel.log');
if (file_exists($logFile)) {
    echo "✓ Log file exists at: {$logFile}\n";
    
    // Get last few lines
    $lines = file($logFile);
    $lastLines = array_slice($lines, -5);
    
    echo "\nLast 5 lines of log:\n";
    echo "------------------------\n";
    foreach ($lastLines as $line) {
        echo $line . "\n";
    }
} else {
    echo "✗ Log file not found\n";
}

echo "\nLogging test completed!\n";
