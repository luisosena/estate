<?php

use App\Models\Property;
use App\Models\User;
use Illuminate\Contracts\Console\Kernel;

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

echo "Debugging landlord tenant count...\n";

// Find a landlord user
$landlord = User::where('role', 'landlord')->first();

if (! $landlord) {
    echo "No landlord user found\n";
    exit;
}

echo 'Landlord: '.$landlord->username.' (ID: '.$landlord->id.")\n";

// Test properties query
$properties = Property::where('owner_id', $landlord->id)->get();
echo 'Properties owned: '.$properties->count()."\n";

foreach ($properties as $property) {
    echo '- Property: '.$property->name.' (ID: '.$property->id.")\n";

    // Test units count
    $units = $property->units;
    echo '  Units: '.$units->count()."\n";

    // Test tenancies count
    $allTenancies = $property->tenancies;
    echo '  All tenancies: '.$allTenancies->count()."\n";

    $activeTenancies = $property->tenancies()->where('tenancies.status', 'active')->get();
    echo '  Active tenancies: '.$activeTenancies->count()."\n";

    // Test the new approach
    echo "  Testing new approach:\n";
    $propertyWithNew = Property::where('id', $property->id)
        ->withCount(['units'])
        ->with(['tenancies' => function ($query) {
            $query->where('tenancies.status', 'active');
        }])
        ->first();

    echo '  New approach - active_tenancies_count: '.$propertyWithNew->tenancies->count()."\n";
}

// Test the exact query from controller
$propertiesWithCounts = Property::where('owner_id', $landlord->id)
    ->withCount(['units'])
    ->with(['tenancies' => function ($query) {
        $query->where('tenancies.status', 'active');
    }])
    ->get();

$totalActiveTenants = $propertiesWithCounts->sum(function ($property) {
    return $property->tenancies->count();
});
echo "\nTotal active tenants (withCount method): ".$totalActiveTenants."\n";

echo "Debug completed\n";
