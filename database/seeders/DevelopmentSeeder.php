<?php

namespace Database\Seeders;

use App\Models\Message;
use App\Models\Payment;
use App\Models\Property;
use App\Models\RentBill;
use App\Models\Tenancy;
use App\Models\TenancyUtility;
use App\Models\Tenant;
use App\Models\TenantIdentification;
use App\Models\Unit;
use App\Models\User;
use App\Models\UtilityBill;
use App\Models\UtilityType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DevelopmentSeeder extends Seeder
{
    public function run(): void
    {
        // =====================================================
        // IDEMPOTENCY CHECK:
        // Skip seeding if users already exist to avoid errors
        // on subsequent boots in production.
        // =====================================================
        if (User::count() > 0) {
            $this->command->info('Database already contains data. Skipping DevelopmentSeeder.');

            return;
        }

        // =====================================================
        // NOTE: This seeder is for development/staging only.
        // It assumes a fresh (empty) database — run via:
        //   php artisan migrate:fresh --seed
        // Truncation is handled by migrate:fresh, not here.
        // =====================================================

        // =====================================================
        // 1. UTILITY TYPES (resolve from DB — seeded by UtilityTypeSeeder)
        // =====================================================
        $uTypes = UtilityType::pluck('id', 'name')->all();
        $this->command->info('Utility types resolved.');

        // =====================================================
        // 2. ADMIN USER
        // =====================================================
        $admin = User::create([
            'name' => 'System Administrator',
            'username' => 'admin',
            'email' => 'admin@estatemanager.co.tz',
            'password' => Hash::make('admin'),
            'role' => 'admin',
        ]);

        // =====================================================
        // 3. LANDLORD USERS & PROPERTIES
        // =====================================================

        // --- Landlord 1: Wanjiku Kamau ---
        $landlord1 = User::create([
            'name' => 'Wanjiku Kamau',
            'username' => 'wanjiku.kamau',
            'email' => 'wanjiku.kamau@estatemanager.co.tz',
            'password' => Hash::make('wanjiku.kamau'),
            'role' => 'landlord',
        ]);

        $propA = Property::create([
            'owner_id' => $landlord1->id,
            'name' => 'Msasani Pearl Apartments',
            'address' => 'Plot 24, Msasani Peninsula',
            'city' => 'Dar es Salaam',
            'state' => 'Dar es Salaam',
            'country' => 'Tanzania',
            'postal_code' => '11101',
            'total_units' => 4,
            'property_type' => 'apartment',
            'status' => 'active',
            'description' => 'Modern 4-unit apartment block on the Msasani Peninsula with ocean views.',
            'amenities' => json_encode(['parking', 'security', 'backup_generator', 'water_tank']),
        ]);

        $propB = Property::create([
            'owner_id' => $landlord1->id,
            'name' => 'Kinondoni Garden Flats',
            'address' => '18 Kawawa Road, Kinondoni',
            'city' => 'Dar es Salaam',
            'state' => 'Dar es Salaam',
            'country' => 'Tanzania',
            'postal_code' => '11103',
            'total_units' => 3,
            'property_type' => 'apartment',
            'status' => 'active',
            'description' => 'Quiet residential flats in Kinondoni, close to shopping centres.',
            'amenities' => json_encode(['parking', 'garden', 'water_tank']),
        ]);

        // --- Landlord 2: Hassan Omar ---
        $landlord2 = User::create([
            'name' => 'Hassan Omar',
            'username' => 'hassan.omar',
            'email' => 'hassan.omar@estatemanager.co.tz',
            'password' => Hash::make('hassan.omar'),
            'role' => 'landlord',
        ]);

        $propC = Property::create([
            'owner_id' => $landlord2->id,
            'name' => 'Arusha Heights Residences',
            'address' => 'Corridor Area, Sokoine Road',
            'city' => 'Arusha',
            'state' => 'Arusha',
            'country' => 'Tanzania',
            'postal_code' => '23101',
            'total_units' => 3,
            'property_type' => 'house',
            'status' => 'active',
            'description' => 'Three independent houses near Arusha CBD, ideal for families.',
            'amenities' => json_encode(['parking', 'garden', 'borehole']),
        ]);

        $this->command->info('Landlords and properties seeded.');

        // =====================================================
        // 4. UNITS
        // =====================================================
        // Property A – Msasani Pearl (4 units)
        $uA1 = Unit::create(['property_id' => $propA->id, 'unit_code' => 'MSN-A101', 'unit_name' => 'Ground Floor Studio',     'status' => 'occupied']);
        $uA2 = Unit::create(['property_id' => $propA->id, 'unit_code' => 'MSN-A102', 'unit_name' => 'Ground Floor 1-Bedroom',  'status' => 'occupied']);
        $uA3 = Unit::create(['property_id' => $propA->id, 'unit_code' => 'MSN-A201', 'unit_name' => 'First Floor 2-Bedroom',   'status' => 'occupied']);
        $uA4 = Unit::create(['property_id' => $propA->id, 'unit_code' => 'MSN-A202', 'unit_name' => 'First Floor 2-Bedroom',   'status' => 'available']);

        // Property B – Kinondoni Garden (3 units)
        $uB1 = Unit::create(['property_id' => $propB->id, 'unit_code' => 'KND-B101', 'unit_name' => 'Ground Floor 1-Bedroom',  'status' => 'occupied']);
        $uB2 = Unit::create(['property_id' => $propB->id, 'unit_code' => 'KND-B102', 'unit_name' => 'Ground Floor 2-Bedroom',  'status' => 'occupied']);
        $uB3 = Unit::create(['property_id' => $propB->id, 'unit_code' => 'KND-B201', 'unit_name' => 'First Floor 2-Bedroom',   'status' => 'available']);

        // Property C – Arusha Heights (3 units)
        $uC1 = Unit::create(['property_id' => $propC->id, 'unit_code' => 'ARU-C001', 'unit_name' => 'House 1 – 3-Bedroom',     'status' => 'occupied']);
        $uC2 = Unit::create(['property_id' => $propC->id, 'unit_code' => 'ARU-C002', 'unit_name' => 'House 2 – 2-Bedroom',     'status' => 'occupied']);
        $uC3 = Unit::create(['property_id' => $propC->id, 'unit_code' => 'ARU-C003', 'unit_name' => 'House 3 – 3-Bedroom',     'status' => 'available']);

        $this->command->info('Units seeded.');

        // =====================================================
        // 5. TENANTS + TENANT USERS
        // =====================================================
        $tenantData = [
            [
                'tenant_code' => 'TEN-00001',
                'full_name' => 'Amina Juma Salim',
                'phone' => '+255754123456',
                'email' => 'amina.salim@gmail.com',
                'emergency_contact_name' => 'Juma Salim',
                'emergency_contact_phone' => '+255754000111',
                'emergency_contact_relation' => 'Father',
                'username' => 'amina.salim',
                'unit' => $uA1,
                'move_in' => '2025-08-01',
                'rent' => 450000,
                'deposit' => 900000,
                'id_type' => 'national_id',
                'id_number' => 'TZ-NID-19870321-001',
            ],
            [
                'tenant_code' => 'TEN-00002',
                'full_name' => 'Bernard Omondi',
                'phone' => '+255653234567',
                'email' => 'bernard.omondi@gmail.com',
                'emergency_contact_name' => 'Grace Omondi',
                'emergency_contact_phone' => '+255653000222',
                'emergency_contact_relation' => 'Wife',
                'username' => 'bernard.omondi',
                'unit' => $uA2,
                'move_in' => '2025-10-01',
                'rent' => 600000,
                'deposit' => 1200000,
                'id_type' => 'passport',
                'id_number' => 'KE-PP-A4521876',
            ],
            [
                'tenant_code' => 'TEN-00003',
                'full_name' => 'Fatuma Rashid',
                'phone' => '+255712345678',
                'email' => 'fatuma.rashid@yahoo.com',
                'emergency_contact_name' => 'Rashid Khalid',
                'emergency_contact_phone' => '+255712000333',
                'emergency_contact_relation' => 'Husband',
                'username' => 'fatuma.rashid',
                'unit' => $uA3,
                'move_in' => '2025-06-15',
                'rent' => 850000,
                'deposit' => 1700000,
                'id_type' => 'national_id',
                'id_number' => 'TZ-NID-19900615-003',
            ],
            [
                'tenant_code' => 'TEN-00004',
                'full_name' => 'David Mwangi Kariuki',
                'phone' => '+255785456789',
                'email' => 'david.mwangi@outlook.com',
                'emergency_contact_name' => 'Susan Kariuki',
                'emergency_contact_phone' => '+255785000444',
                'emergency_contact_relation' => 'Sister',
                'username' => 'david.mwangi',
                'unit' => $uB1,
                'move_in' => '2025-09-01',
                'rent' => 550000,
                'deposit' => 1100000,
                'id_type' => 'drivers_license',
                'id_number' => 'TZ-DL-2019-00445',
            ],
            [
                'tenant_code' => 'TEN-00005',
                'full_name' => 'Zainab Mohammed Ali',
                'phone' => '+255622567890',
                'email' => 'zainab.ali@gmail.com',
                'emergency_contact_name' => 'Mohammed Ali',
                'emergency_contact_phone' => '+255622000555',
                'emergency_contact_relation' => 'Brother',
                'username' => 'zainab.ali',
                'unit' => $uC1,
                'move_in' => '2025-11-01',
                'rent' => 700000,
                'deposit' => 1400000,
                'id_type' => 'national_id',
                'id_number' => 'TZ-NID-19951120-005',
            ],
        ];

        $tenants = [];
        $tenancies = [];

        foreach ($tenantData as $td) {
            $tenant = Tenant::create([
                'tenant_code' => $td['tenant_code'],
                'full_name' => $td['full_name'],
                'phone' => $td['phone'],
                'email' => $td['email'],
                'emergency_contact_name' => $td['emergency_contact_name'],
                'emergency_contact_phone' => $td['emergency_contact_phone'],
                'emergency_contact_relation' => $td['emergency_contact_relation'],
            ]);

            $user = User::create([
                'name' => $td['full_name'],
                'username' => $td['username'],
                'email' => $td['email'],
                'password' => Hash::make($td['username']),
                'role' => 'tenant',
                'tenant_id' => $tenant->id,
            ]);
            $tenant->update(['id' => $tenant->id]); // keep reference

            TenantIdentification::create([
                'tenant_id' => $tenant->id,
                'id_type' => $td['id_type'],
                'id_number' => $td['id_number'],
                'verified_at' => now()->subDays(rand(10, 60)),
            ]);

            $tenancy = Tenancy::create([
                'tenant_id' => $tenant->id,
                'unit_id' => $td['unit']->id,
                'move_in_date' => $td['move_in'],
                'status' => 'active',
                'monthly_rent' => $td['rent'],
                'security_deposit' => $td['deposit'],
            ]);

            $tenants[] = ['tenant' => $tenant, 'user' => $user, 'data' => $td];
            $tenancies[] = $tenancy;
        }

        $this->command->info('Tenants, users, IDs and tenancies seeded.');

        // =====================================================
        // 6. TENANCY UTILITIES
        // =====================================================
        // Utility configs: [tenancy_index, utility_name, amount, provider, meter_number]
        $utilityConfigs = [
            [0, 'Water',       32000,  'DAWASA',             'MTR-W-MSN-A101'],
            [0, 'Electricity', 68000,  'TANESCO',            'MTR-E-MSN-A101'],
            [0, 'Internet',    45000,  'Zuku Fibre',         null],
            [0, 'Security',    25000,  'Msasani Pearl Mgt',  null],

            [1, 'Water',       38000,  'DAWASA',             'MTR-W-MSN-A102'],
            [1, 'Electricity', 92000,  'TANESCO',            'MTR-E-MSN-A102'],
            [1, 'Internet',    45000,  'Zuku Fibre',         null],
            [1, 'Garbage',     8000,   'Dar Clean Services', null],

            [2, 'Water',       55000,  'DAWASA',             'MTR-W-MSN-A201'],
            [2, 'Electricity', 145000, 'TANESCO',            'MTR-E-MSN-A201'],
            [2, 'Internet',    65000,  'Liquid Telecom',     null],
            [2, 'Security',    25000,  'Msasani Pearl Mgt',  null],
            [2, 'Parking',     30000,  'Msasani Pearl Mgt',  null],

            [3, 'Water',       28000,  'DAWASA',             'MTR-W-KND-B101'],
            [3, 'Electricity', 75000,  'TANESCO',            'MTR-E-KND-B101'],

            [4, 'Water',       42000,  'AUWSA',              'MTR-W-ARU-C001'],
            [4, 'Electricity', 110000, 'TANESCO',            'MTR-E-ARU-C001'],
            [4, 'Gas',         22000,  'Oryx Energy',        'MTR-G-ARU-C001'],
            [4, 'Internet',    50000,  'TTCL Fibre',         null],
        ];

        $tenancyUtilities = [];
        foreach ($utilityConfigs as [$ti, $uName, $amount, $provider, $meter]) {
            $tu = TenancyUtility::create([
                'tenancy_id' => $tenancies[$ti]->id,
                'utility_type_id' => $uTypes[$uName],
                'amount' => $amount,
                'billing_cycle' => 'monthly',
                'provider' => $provider,
                'meter_number' => $meter,
                'status' => 'active',
            ]);
            $tenancyUtilities[] = ['tu' => $tu, 'tenancy_index' => $ti, 'amount' => $amount];
        }

        $this->command->info('Tenancy utilities seeded.');

        // =====================================================
        // 7. RENT BILLS (past 3 months per tenancy)
        // =====================================================
        // Current date reference: 2026-03-26
        $billingMonths = ['2026-01-01', '2026-02-01', '2026-03-01'];
        $dueDays = ['2026-01-05', '2026-02-05', '2026-03-05'];

        // Statuses for each tenancy x month: [tenancy0, tenancy1, tenancy2, tenancy3, tenancy4]
        // Month Jan: all paid | Feb: mixed | Mar: some pending/overdue
        $rentBillStatuses = [
            // [jan,  feb,       mar]
            ['paid', 'paid',    'paid'],      // Amina   – reliable payer
            ['paid', 'paid',    'overdue'],   // Bernard – missed March
            ['paid', 'partial', 'overdue'],   // Fatuma  – struggling
            ['paid', 'paid',    'paid'],      // David   – reliable
            ['paid', 'paid',    'pending'],   // Zainab  – new, March pending
        ];

        $rentAmountPaid = [
            [['paid' => 450000], ['paid' => 450000], ['paid' => 450000]],
            [['paid' => 600000], ['paid' => 600000], ['paid' => 0]],
            [['paid' => 850000], ['paid' => 400000], ['paid' => 0]],
            [['paid' => 550000], ['paid' => 550000], ['paid' => 550000]],
            [['paid' => 700000], ['paid' => 700000], ['paid' => 0]],
        ];

        $rentBills = [];
        foreach ($tenancies as $ti => $tenancy) {
            $rentBills[$ti] = [];
            foreach ($billingMonths as $mi => $bMonth) {
                $status = $rentBillStatuses[$ti][$mi];
                $amtDue = $tenancy->monthly_rent;
                $amtPaid = $rentAmountPaid[$ti][$mi]['paid'];

                $rb = RentBill::create([
                    'tenancy_id' => $tenancy->id,
                    'billing_month' => $bMonth,
                    'amount_due' => $amtDue,
                    'amount_paid' => $amtPaid,
                    'due_date' => $dueDays[$mi],
                    'status' => $status,
                ]);
                $rentBills[$ti][$mi] = $rb;
            }
        }

        $this->command->info('Rent bills seeded.');

        // =====================================================
        // 8. UTILITY BILLS (past 2 months per tenancy utility)
        // =====================================================
        $ubMonths = ['2026-02-01', '2026-03-01'];
        $ubDueDates = ['2026-02-28', '2026-03-31'];

        $utilityBills = [];
        foreach ($tenancyUtilities as $idx => $tucfg) {
            $utilityBills[$idx] = [];
            $tu = $tucfg['tu'];
            $amount = $tucfg['amount'];
            $ti = $tucfg['tenancy_index'];

            foreach ($ubMonths as $mi => $bMonth) {
                // Feb: paid, Mar: pending for struggling tenants, paid for reliable ones
                $reliableTenants = [0, 3]; // Amina, David
                if (in_array($ti, $reliableTenants)) {
                    $status = 'paid';
                    $amtPaid = $amount;
                } elseif ($ti === 1) {          // Bernard
                    $status = ($mi === 0) ? 'paid' : 'pending';
                    $amtPaid = ($mi === 0) ? $amount : 0;
                } elseif ($ti === 2) {          // Fatuma
                    $status = ($mi === 0) ? 'partial' : 'overdue';
                    $amtPaid = ($mi === 0) ? intval($amount * 0.5) : 0;
                } else {                        // Zainab
                    $status = ($mi === 0) ? 'paid' : 'pending';
                    $amtPaid = ($mi === 0) ? $amount : 0;
                }

                $ub = UtilityBill::create([
                    'tenancy_utility_id' => $tu->id,
                    'billing_month' => $bMonth,
                    'amount_due' => $amount,
                    'amount_paid' => $amtPaid,
                    'due_date' => $ubDueDates[$mi],
                    'status' => $status,
                ]);
                $utilityBills[$idx][$mi] = $ub;
            }
        }

        $this->command->info('Utility bills seeded.');

        // =====================================================
        // 9. PAYMENTS (linked to rent_bills and utility_bills)
        // =====================================================
        $methods = ['bank_transfer', 'mobile_money', 'cash', 'card'];

        // Rent payments for paid rent bills
        foreach ($tenancies as $ti => $tenancy) {
            $tenantRec = $tenants[$ti]['tenant'];
            foreach ($rentBills[$ti] as $mi => $rb) {
                if ($rb->amount_paid > 0) {
                    Payment::create([
                        'tenant_id' => $tenantRec->id,
                        'tenancy_id' => $tenancy->id,
                        'rent_bill_id' => $rb->id,
                        'amount' => $rb->amount_paid,
                        'payment_type' => 'rent',
                        'payment_method' => $methods[$ti % count($methods)],
                        'status' => $rb->amount_paid >= $rb->amount_due ? 'paid' : 'partial',
                        'paid_at' => now()->startOfMonth()->subMonths(2 - $mi)->addDays(rand(0, 4)),
                        'due_date' => $rb->due_date,
                        'reference_number' => 'RNT-'.strtoupper(substr(md5($rb->id.$mi), 0, 8)),
                    ]);
                }
            }
        }

        // Utility payments for paid utility bills
        foreach ($tenancyUtilities as $idx => $tucfg) {
            $ti = $tucfg['tenancy_index'];
            $tenantRec = $tenants[$ti]['tenant'];
            $tenancy = $tenancies[$ti];

            foreach ($utilityBills[$idx] as $mi => $ub) {
                if ($ub->amount_paid > 0) {
                    Payment::create([
                        'tenant_id' => $tenantRec->id,
                        'tenancy_id' => $tenancy->id,
                        'utility_bill_id' => $ub->id,
                        'amount' => $ub->amount_paid,
                        'payment_type' => 'utility',
                        'payment_method' => $methods[($ti + 1) % count($methods)],
                        'status' => $ub->amount_paid >= $ub->amount_due ? 'paid' : 'partial',
                        'paid_at' => now()->startOfMonth()->subMonths(1 - $mi)->addDays(rand(1, 6)),
                        'due_date' => $ub->due_date,
                        'reference_number' => 'UTL-'.strtoupper(substr(md5($ub->id.$mi), 0, 8)),
                    ]);
                }
            }
        }

        // Security deposit payments
        foreach ($tenancies as $ti => $tenancy) {
            $tenantRec = $tenants[$ti]['tenant'];
            Payment::create([
                'tenant_id' => $tenantRec->id,
                'tenancy_id' => $tenancy->id,
                'amount' => $tenancy->security_deposit,
                'payment_type' => 'rent',
                'payment_method' => 'bank_transfer',
                'status' => 'paid',
                'paid_at' => $tenancy->move_in_date,
                'due_date' => $tenancy->move_in_date,
                'reference_number' => 'DEP-'.strtoupper($tenants[$ti]['data']['id_number'] ? substr(md5($tenants[$ti]['data']['id_number']), 0, 6) : 'INIT'),
                'notes' => 'Security deposit paid on move-in',
            ]);
        }

        $this->command->info('Payments seeded.');

        // =====================================================
        // 10. MESSAGES
        // =====================================================
        $landlord1User = $landlord1;
        $t0User = $tenants[0]['user'];
        $t1User = $tenants[1]['user'];
        $t2User = $tenants[2]['user'];
        $t4User = $tenants[4]['user'];

        // messages table only has: sender_id, receiver_id, message
        $msgs = [
            [$t0User->id,       $landlord1User->id, 'Hi, the water pressure in unit MSN-A101 has been very low for the past few days. Could you please look into it?'],
            [$landlord1User->id, $t0User->id,       'Hello Amina, thank you for letting us know. I have contacted DAWASA and a technician will visit tomorrow between 9am and 12pm.'],
            [$t1User->id,       $landlord1User->id, 'Good morning, please note I am experiencing a delay with my bank transfer this month. I will have it sorted by end of week.'],
            [$landlord1User->id, $t1User->id,       'Hello Bernard, thanks for the heads up. Please ensure payment is made by 31st March to avoid a late penalty. We look forward to receiving it.'],
            [$t2User->id,       $landlord1User->id, 'The window latch in the bedroom of A201 is broken. It cannot close properly. Please arrange for a repair.'],
            [$t4User->id,       $admin->id,         'I am unable to log into the tenant portal. Could you please reset my password or guide me on how to do it myself?'],
        ];

        foreach ($msgs as [$sid, $rid, $body]) {
            Message::create([
                'sender_id' => $sid,
                'receiver_id' => $rid,
                'message' => $body,
            ]);
        }

        $this->command->info('Messages seeded.');

        // =====================================================
        // 11. NOTIFICATIONS (polymorphic on Users)
        // =====================================================
        $notifs = [
            [$t0User->id, 'App\Notifications\RentDueSoon',      ['title' => 'Rent Due in 3 Days', 'message' => 'Your rent of TZS 450,000 for April is due on 5th April 2026.', 'amount' => 450000]],
            [$t1User->id, 'App\Notifications\PaymentOverdue',   ['title' => 'Overdue Rent Notice', 'message' => 'Your March rent payment of TZS 600,000 is overdue. Please pay immediately.', 'amount' => 600000]],
            [$t2User->id, 'App\Notifications\PaymentOverdue',   ['title' => 'Overdue Bills Notice', 'message' => 'You have overdue utility bills. Please check your account.', 'amount' => 0]],
            [$t0User->id, 'App\Notifications\MaintenanceAlert', ['title' => 'Scheduled Maintenance', 'message' => 'Water supply will be interrupted on 2nd April from 8am–1pm for tank cleaning.', 'date' => '2026-04-02']],
            [$t4User->id, 'App\Notifications\WelcomeNotification', ['title' => 'Welcome to Msasani Pearl!', 'message' => 'Welcome Zainab. Your account is now active. Please review your tenancy details.']],
        ];

        foreach ($notifs as [$userId, $type, $data]) {
            DB::table('notifications')->insert([
                'id' => (string) Str::uuid(),
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => $userId,
                'type' => $type,
                'data' => json_encode($data),
                'read_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('Notifications seeded.');

        // =====================================================
        // SUMMARY
        // =====================================================
        $this->command->info('');
        $this->command->info('====================================================');
        $this->command->info('  DEVELOPMENT SEEDER COMPLETED SUCCESSFULLY');
        $this->command->info('====================================================');
        $this->command->info('  Properties      : '.Property::count());
        $this->command->info('  Units           : '.Unit::count());
        $this->command->info('  Tenants         : '.Tenant::count());
        $this->command->info('  Users           : '.User::count());
        $this->command->info('  Tenancies       : '.Tenancy::count());
        $this->command->info('  Utility Types   : '.UtilityType::count());
        $this->command->info('  Tenancy Utils   : '.TenancyUtility::count());
        $this->command->info('  Rent Bills      : '.RentBill::count());
        $this->command->info('  Utility Bills   : '.UtilityBill::count());
        $this->command->info('  Payments        : '.Payment::count());
        $this->command->info('  Messages        : '.Message::count());
        $this->command->info('====================================================');
        $this->command->info('  LOGIN CREDENTIALS  (password = username)');
        $this->command->info('----------------------------------------------------');
        $this->command->info('  admin          admin          / admin');
        $this->command->info('  landlord       wanjiku.kamau  / wanjiku.kamau');
        $this->command->info('  landlord       hassan.omar    / hassan.omar');
        $this->command->info('  tenant         amina.salim    / amina.salim');
        $this->command->info('  tenant         bernard.omondi / bernard.omondi');
        $this->command->info('  tenant         fatuma.rashid  / fatuma.rashid');
        $this->command->info('  tenant         david.mwangi   / david.mwangi');
        $this->command->info('  tenant         zainab.ali     / zainab.ali');
        $this->command->info('====================================================');
    }
}
