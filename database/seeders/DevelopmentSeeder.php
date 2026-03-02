<?php

namespace Database\Seeders;

use App\Models\Property;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Unit;
use App\Models\Tenancy;
use App\Models\TenantIdentification;
use App\Models\Payment;
use App\Models\Utility;
use App\Models\Notification;
use App\Models\Message;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DevelopmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data (optional - comment out if you want to keep existing)
        $this->call(TruncateTablesSeeder::class);

        // ===========================================
        // 1. CREATE USERS (landlord & admin first so properties can reference them)
        // ===========================================
        $adminUser = User::create([
            'name'      => 'Admin User',
            'username'  => 'admin',
            'email'     => 'admin@example.com',
            'password'  => Hash::make('password'),
            'role'      => 'admin',
            'tenant_id' => null,
        ]);

        $landlordUser = User::create([
            'name'      => 'Landlord User',
            'username'  => 'landlord',
            'email'     => 'landlord@example.com',
            'password'  => Hash::make('password'),
            'role'      => 'landlord',
            'tenant_id' => null,
        ]);

        $this->command->info('Admin and Landlord users created.');

        // ===========================================
        // 2. CREATE PROPERTIES (owned by landlord)
        // ===========================================
        $propertyA = Property::create([
            'owner_id'    => $landlordUser->id,
            'name'        => 'Sunrise Apartments',
            'total_units' => 3,
            'address'     => '12 Sunrise Avenue, Dar es Salaam',
        ]);

        $propertyB = Property::create([
            'owner_id'    => $landlordUser->id,
            'name'        => 'Hilltop Residences',
            'total_units' => 2,
            'address'     => '45 Hilltop Road, Arusha',
        ]);

        $this->command->info('Properties created successfully.');

        // ===========================================
        // 3. CREATE UNITS (linked to properties)
        // ===========================================
        $units = [
            // Sunrise Apartments units
            ['property_id' => $propertyA->id, 'unit_code' => 'A101', 'unit_name' => 'Studio Apartment - Ground Floor', 'status' => 'occupied'],
            ['property_id' => $propertyA->id, 'unit_code' => 'A102', 'unit_name' => '1 Bedroom - Ground Floor', 'status' => 'occupied'],
            ['property_id' => $propertyA->id, 'unit_code' => 'A201', 'unit_name' => '2 Bedroom - First Floor', 'status' => 'occupied'],
            // Hilltop Residences units
            ['property_id' => $propertyB->id, 'unit_code' => 'B101', 'unit_name' => '2 Bedroom - Ground Floor', 'status' => 'available'],
            ['property_id' => $propertyB->id, 'unit_code' => 'B201', 'unit_name' => '3 Bedroom Penthouse', 'status' => 'available'],
        ];

        foreach ($units as $unitData) {
            Unit::create($unitData);
        }

        $this->command->info('Units created successfully.');

        // ===========================================
        // 4. CREATE TENANTS
        // ===========================================
        $tenants = [
            [
                'full_name' => 'John Doe',
                'phone' => '+1234567890',
                'email' => 'john.doe@example.com',
                'emergency_contact_name' => 'Jane Doe',
                'emergency_contact_phone' => '+0987654321',
                'emergency_contact_relation' => 'Spouse',
            ],
            [
                'full_name' => 'Sarah Johnson',
                'phone' => '+2345678901',
                'email' => 'sarah.j@example.com',
                'emergency_contact_name' => 'Mike Johnson',
                'emergency_contact_phone' => '+1987654320',
                'emergency_contact_relation' => 'Brother',
            ],
            [
                'full_name' => 'Michael Smith',
                'phone' => '+3456789012',
                'email' => 'michael.smith@example.com',
                'emergency_contact_name' => 'Emma Smith',
                'emergency_contact_phone' => '+1876543210',
                'emergency_contact_relation' => 'Mother',
            ],
            [
                'full_name' => 'Emily Brown',
                'phone' => '+4567890123',
                'email' => 'emily.b@example.com',
                'emergency_contact_name' => 'David Brown',
                'emergency_contact_phone' => '+1765432109',
                'emergency_contact_relation' => 'Father',
            ],
        ];

        $createdTenants = [];
        foreach ($tenants as $tenantData) {
            $createdTenants[] = Tenant::create($tenantData);
        }

        $this->command->info('Tenants created successfully.');

        // ===========================================
        // 5. CREATE TENANT USERS (linked to tenant records)
        // ===========================================
        $tenantUsers = [
            [
                'name' => 'John Doe',
                'username' => 'johndoe',
                'email' => 'john.doe@example.com',
                'password' => Hash::make('password'),
                'role' => 'tenant',
                'tenant_id' => $createdTenants[0]->id,
            ],
            [
                'name' => 'Sarah Johnson',
                'username' => 'sarahj',
                'email' => 'sarah.j@example.com',
                'password' => Hash::make('password'),
                'role' => 'tenant',
                'tenant_id' => $createdTenants[1]->id,
            ],
            [
                'name' => 'Michael Smith',
                'username' => 'michaels',
                'email' => 'michael.smith@example.com',
                'password' => Hash::make('password'),
                'role' => 'tenant',
                'tenant_id' => $createdTenants[2]->id,
            ],
        ];

        $createdTenantUsers = [];
        foreach ($tenantUsers as $userData) {
            $createdTenantUsers[] = User::create($userData);
        }

        // Build $createdUsers array in the same order as before for message references:
        // [0] = John Doe (tenant), [1] = Sarah Johnson (tenant), [2] = Michael Smith (tenant),
        // [3] = Admin, [4] = Landlord
        $createdUsers = array_merge($createdTenantUsers, [$adminUser, $landlordUser]);

        $this->command->info('Tenant users created successfully.');

        // ===========================================
        // 4. CREATE TENANT IDENTIFICATIONS
        // ===========================================
        $identifications = [
            [
                'tenant_id' => $createdTenants[0]->id,
                'id_type' => 'passport',
                'id_number' => 'P123456789',
                'verified_at' => now(),
            ],
            [
                'tenant_id' => $createdTenants[1]->id,
                'id_type' => 'drivers_license',
                'id_number' => 'DL98765432',
                'verified_at' => now(),
            ],
            [
                'tenant_id' => $createdTenants[2]->id,
                'id_type' => 'national_id',
                'id_number' => 'NID45678901',
                'verified_at' => null,
            ],
        ];

        foreach ($identifications as $idData) {
            TenantIdentification::create($idData);
        }

        $this->command->info('Tenant identifications created successfully.');

        // ===========================================
        // 6. CREATE TENANCIES (active leases)
        // ===========================================
        $units = Unit::all();
        
        $tenancies = [
            [
                'tenant_id' => $createdTenants[0]->id,
                'unit_id' => $units[0]->id, // A101
                'move_in_date' => now()->subMonths(6),
                'status' => 'active',
                'monthly_rent' => 1200.00,
                'security_deposit' => 2400.00,
            ],
            [
                'tenant_id' => $createdTenants[1]->id,
                'unit_id' => $units[1]->id, // A102
                'move_in_date' => now()->subMonths(3),
                'status' => 'active',
                'monthly_rent' => 950.00,
                'security_deposit' => 1900.00,
            ],
            [
                'tenant_id' => $createdTenants[2]->id,
                'unit_id' => $units[2]->id, // B201
                'move_in_date' => now()->subMonths(1),
                'status' => 'active',
                'monthly_rent' => 1500.00,
                'security_deposit' => 3000.00,
            ],
        ];

        $createdTenancies = [];
        foreach ($tenancies as $tenancyData) {
            $createdTenancies[] = Tenancy::create($tenancyData);
        }

        $this->command->info('Tenancies created successfully.');

        // ===========================================
        // 6. CREATE PAYMENTS
        // ===========================================
        $payments = [
            // Tenant 1 payments (John Doe)
            [
                'tenant_id' => $createdTenants[0]->id,
                'tenancy_id' => $createdTenancies[0]->id,
                'amount' => 1200.00,
                'payment_type' => 'rent',
                'payment_method' => 'bank_transfer',
                'status' => 'paid',
                'paid_at' => now()->subDays(5),
            ],
            [
                'tenant_id' => $createdTenants[0]->id,
                'tenancy_id' => $createdTenancies[0]->id,
                'amount' => 85.50,
                'payment_type' => 'utility',
                'payment_method' => 'credit_card',
                'status' => 'paid',
                'paid_at' => now()->subDays(5),
            ],
            [
                'tenant_id' => $createdTenants[0]->id,
                'tenancy_id' => $createdTenancies[0]->id,
                'amount' => 1200.00,
                'payment_type' => 'rent',
                'payment_method' => 'bank_transfer',
                'status' => 'paid',
                'paid_at' => now()->subMonths(1)->addDays(2),
            ],
            
            // Tenant 2 payments (Sarah Johnson)
            [
                'tenant_id' => $createdTenants[1]->id,
                'tenancy_id' => $createdTenancies[1]->id,
                'amount' => 950.00,
                'payment_type' => 'rent',
                'payment_method' => 'cash',
                'status' => 'paid',
                'paid_at' => now()->subDays(2),
            ],
            [
                'tenant_id' => $createdTenants[1]->id,
                'tenancy_id' => $createdTenancies[1]->id,
                'amount' => 950.00,
                'payment_type' => 'rent',
                'payment_method' => 'bank_transfer',
                'status' => 'paid',
                'paid_at' => now()->subMonths(1),
            ],
            
            // Tenant 3 payments (Michael Smith) - partial/overdue
            [
                'tenant_id' => $createdTenants[2]->id,
                'tenancy_id' => $createdTenancies[2]->id,
                'amount' => 1500.00,
                'payment_type' => 'rent',
                'payment_method' => 'credit_card',
                'status' => 'partial',
                'paid_at' => now()->subDays(10),
            ],
            [
                'tenant_id' => $createdTenants[2]->id,
                'tenancy_id' => $createdTenancies[2]->id,
                'amount' => 120.75,
                'payment_type' => 'utility',
                'payment_method' => 'credit_card',
                'status' => 'overdue',
                'paid_at' => null,
            ],
        ];

        foreach ($payments as $paymentData) {
            Payment::create($paymentData);
        }

        $this->command->info('Payments created successfully.');

        // ===========================================
        // 7. CREATE UTILITIES
        // ===========================================
        $utilities = [
            // Tenant 1 utilities
            [
                'tenancy_id' => $createdTenancies[0]->id,
                'type' => 'water',
                'amount' => 45.50,
                'billing_period' => 'March 2026',
                'status' => 'paid',
            ],
            [
                'tenancy_id' => $createdTenancies[0]->id,
                'type' => 'electricity',
                'amount' => 89.75,
                'billing_period' => 'March 2026',
                'status' => 'paid',
            ],
            [
                'tenancy_id' => $createdTenancies[0]->id,
                'type' => 'internet',
                'amount' => 60.00,
                'billing_period' => 'March 2026',
                'status' => 'paid',
            ],
            
            // Tenant 2 utilities
            [
                'tenancy_id' => $createdTenancies[1]->id,
                'type' => 'water',
                'amount' => 38.25,
                'billing_period' => 'March 2026',
                'status' => 'paid',
            ],
            [
                'tenancy_id' => $createdTenancies[1]->id,
                'type' => 'electricity',
                'amount' => 67.80,
                'billing_period' => 'March 2026',
                'status' => 'paid',
            ],
            
            // Tenant 3 utilities - unpaid
            [
                'tenancy_id' => $createdTenancies[2]->id,
                'type' => 'water',
                'amount' => 52.30,
                'billing_period' => 'March 2026',
                'status' => 'unpaid',
            ],
            [
                'tenancy_id' => $createdTenancies[2]->id,
                'type' => 'electricity',
                'amount' => 112.45,
                'billing_period' => 'March 2026',
                'status' => 'unpaid',
            ],
            [
                'tenancy_id' => $createdTenancies[2]->id,
                'type' => 'gas',
                'amount' => 35.20,
                'billing_period' => 'March 2026',
                'status' => 'unpaid',
            ],
        ];

        foreach ($utilities as $utilityData) {
            Utility::create($utilityData);
        }

        $this->command->info('Utilities created successfully.');

        // ===========================================
        // 8. CREATE NOTIFICATIONS
        // ===========================================
        $notifications = [
            [
                'tenant_id' => $createdTenants[0]->id,
                'type' => 'payment_reminder',
                'title' => 'Rent Due Soon',
                'message' => 'Your rent payment of $1200.00 is due in 3 days.',
                'read_at' => now()->subDays(1),
            ],
            [
                'tenant_id' => $createdTenants[0]->id,
                'type' => 'maintenance',
                'title' => 'Scheduled Maintenance',
                'message' => 'Water maintenance scheduled for April 15th from 10am-2pm.',
                'read_at' => null,
            ],
            [
                'tenant_id' => $createdTenants[1]->id,
                'type' => 'payment_received',
                'title' => 'Payment Confirmed',
                'message' => 'Your payment of $950.00 has been received. Thank you!',
                'read_at' => now(),
            ],
            [
                'tenant_id' => $createdTenants[2]->id,
                'type' => 'overdue_notice',
                'title' => 'Overdue Payment Notice',
                'message' => 'Your utility payment of $120.75 is now overdue. Please pay as soon as possible.',
                'read_at' => null,
            ],
            [
                'tenant_id' => $createdTenants[2]->id,
                'type' => 'lease_reminder',
                'title' => 'Lease Renewal',
                'message' => 'Your lease is up for renewal in 2 months. Please contact the office.',
                'read_at' => null,
            ],
        ];

        foreach ($notifications as $notificationData) {
            Notification::create($notificationData);
        }

        $this->command->info('Notifications created successfully.');

        // ===========================================
        // 9. CREATE MESSAGES
        // ===========================================
        $messages = [
            [
                'sender_id' => $createdUsers[0]->id, // John Doe
                'receiver_id' => $createdUsers[4]->id, // Landlord
                'message' => 'Hello, I have a question about the parking situation.',
            ],
            [
                'sender_id' => $createdUsers[4]->id, // Landlord
                'receiver_id' => $createdUsers[0]->id, // John Doe
                'message' => 'Hi John, parking spot #12 is assigned to your unit. Let me know if you need anything else.',
            ],
            [
                'sender_id' => $createdUsers[1]->id, // Sarah Johnson
                'receiver_id' => $createdUsers[4]->id, // Landlord
                'message' => 'The kitchen sink is leaking. Can someone come take a look?',
            ],
            [
                'sender_id' => $createdUsers[4]->id, // Landlord
                'receiver_id' => $createdUsers[1]->id, // Sarah Johnson
                'message' => 'Maintenance will stop by tomorrow morning between 9-11am.',
            ],
            [
                'sender_id' => $createdUsers[2]->id, // Michael Smith
                'receiver_id' => $createdUsers[3]->id, // Admin
                'message' => 'I need to update my emergency contact information.',
            ],
        ];

        foreach ($messages as $messageData) {
            Message::create($messageData);
        }

        $this->command->info('Messages created successfully.');

        // ===========================================
        // SUMMARY
        // ===========================================
        $this->command->info('=====================================');
        $this->command->info('DEVELOPMENT SEEDER COMPLETED SUCCESSFULLY');
        $this->command->info('=====================================');
        $this->command->info('Properties: ' . Property::count());
        $this->command->info('Units: ' . Unit::count());
        $this->command->info('Tenants: ' . Tenant::count());
        $this->command->info('Users: ' . User::count());
        $this->command->info('Tenancies: ' . Tenancy::count());
        $this->command->info('Payments: ' . Payment::count());
        $this->command->info('Utilities: ' . Utility::count());
        $this->command->info('Notifications: ' . Notification::count());
        $this->command->info('Messages: ' . Message::count());
        $this->command->info('=====================================');
        $this->command->info('Login credentials:');
        $this->command->info('Tenant: johndoe / password');
        $this->command->info('Tenant: sarahj / password');
        $this->command->info('Tenant: michaels / password');
        $this->command->info('Admin: admin / password');
        $this->command->info('Landlord: landlord / password');
        $this->command->info('=====================================');
        $this->command->info('Landlord tenant views:');
        $this->command->info('  All tenants: /landlord/tenants');
        $this->command->info('  By property: /landlord/properties/{id}/tenants');
        $this->command->info('=====================================');
    }
}