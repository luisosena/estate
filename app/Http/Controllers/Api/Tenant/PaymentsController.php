<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Tenancy;
use App\Models\UtilityBill;
use App\Services\RentBillService;
use App\Services\UtilityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $tenant = $user->tenant;

        // Get the active tenancy for payment calculations
        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->with(['unit', 'unit.property'])
            ->first();

        // Get the most recent tenancy (active or ended) to show unit/property info if no active tenancy
        $latestTenancy = $tenant->tenancies()
            ->with(['unit', 'unit.property'])
            ->orderBy('created_at', 'desc')
            ->first();

        // Use active tenancy for unit/property info, fallback to latest if no active tenancy
        $displayTenancy = $activeTenancy ?? $latestTenancy;
        $unit = $displayTenancy?->unit;
        $property = $unit?->property;

        // Get payments from active tenancy only for privacy
        $paymentsQuery = $activeTenancy
            ? $activeTenancy->payments()
                ->with(['tenancy.unit', 'tenancy.unit.property'])
            : Payment::whereNull('id'); // Empty query if no active tenancy

        $payments = $paymentsQuery->get()
            ->sortByDesc('paid_at')
            ->map(function ($payment) use ($tenant, $unit, $property) {
                return [
                    'id' => $payment->id,
                    'amount' => $payment->amount,
                    'payment_type' => $payment->payment_type,
                    'payment_method' => $payment->payment_method,
                    'status' => $payment->status,
                    'paid_at' => $payment->paid_at,
                    'due_date' => $payment->due_date,
                    'created_at' => $payment->created_at,
                    'tenant_name' => $tenant->full_name,
                    'unit_number' => $unit?->unit_code,
                    'property_name' => $property?->name,
                ];
            })
            ->values() ?? collect();

        // Calculate pending amount from active tenancy rent payments only
        $pendingAmount = 0;
        $monthlyRent = $activeTenancy?->monthly_rent ?? 0;
        $totalPaid = $activeTenancy
            ? $activeTenancy->payments()
                ->whereIn('status', ['paid', 'partial'])
                ->where('payment_type', 'rent')
                ->sum('amount')
            : 0;
        $pendingAmount = max(0, $monthlyRent - $totalPaid);

        return response()->json([
            'tenant' => [
                'id' => $tenant->id,
                'full_name' => $tenant->full_name,
                'phone' => $tenant->phone,
                'email' => $tenant->email,
            ],
            'tenancy' => $displayTenancy ? [
                'id' => $displayTenancy->id,
                'monthly_rent' => $monthlyRent,
                'status' => $activeTenancy ? 'active' : 'ended',
            ] : null,
            'payments' => $payments,
            'pendingAmount' => $pendingAmount,
        ]);
    }

    /**
     * Store a new payment.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $tenant = $user->tenant;

        $validated = $request->validate([
            'amount' => 'required|numeric|min:1|max:100000000',
            'payment_type' => 'required|in:rent,utility',
            'payment_method' => 'required|in:mobile_money,bank_transfer',
            'utility_bill_id' => 'required_if:payment_type,utility|nullable|exists:utility_bills,id',
            'rent_bill_id' => 'nullable|exists:rent_bills,id',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->first();

        if (! $activeTenancy) {
            return response()->json([
                'error' => 'No active tenancy found.',
            ], 422);
        }

        try {
            // Use DB transaction with row locking to prevent race conditions
            $result = DB::transaction(function () use ($activeTenancy, $validated, $tenant) {
                // Lock the tenancy row itself for update to prevent concurrent modifications
                $lockedTenancy = Tenancy::lockForUpdate()->find($activeTenancy->id);

                // If tenancy was deleted during concurrent request, fail gracefully
                if (! $lockedTenancy) {
                    return ['error' => 'Transaction conflict. Please try again.'];
                }

                // Duplicate Payment Prevention: Check for recent duplicate payments
                $recentDuplicate = $activeTenancy->payments()
                    ->where('amount', $validated['amount'])
                    ->where('payment_method', $validated['payment_method'])
                    ->where('payment_type', $validated['payment_type'])
                    ->where('created_at', '>=', now()->subSeconds(30))
                    ->exists();

                if ($recentDuplicate) {
                    return ['error' => 'A duplicate payment was recently submitted. Please wait a moment and try again.'];
                }

                // Calculate status based on total paid vs monthly rent
                $monthlyRent = $activeTenancy->monthly_rent ?? 0;
                $currentTotalPaid = $activeTenancy->payments()
                    ->whereIn('status', ['paid', 'partial'])
                    ->where('payment_type', 'rent')
                    ->sum('amount');
                $newTotalPaid = $currentTotalPaid + $validated['amount'];

                // Calculate excess amount for rent payments (overpayment handling)
                $excessAmount = 0;
                $rentAmount = $validated['amount'];

                if ($validated['payment_type'] === 'rent' && $monthlyRent > 0) {
                    $remainingBalance = max(0, $monthlyRent - $currentTotalPaid);
                    if ($validated['amount'] > $remainingBalance) {
                        $excessAmount = $validated['amount'] - $remainingBalance;
                        $rentAmount = $remainingBalance;
                    }
                }

                // Determine initial status for this payment
                // For utility payments: status will be synced from utility bill below
                // For rent payments: status will be determined by rent bill after processing
                $status = 'pending';

                // Handle rent_bill_id for rent payments using the service
                $rentBillId = null;
                $rentBillError = null;
                if ($validated['payment_type'] === 'rent') {
                    $billLinkResult = app(RentBillService::class)->linkPaymentToBill(
                        $activeTenancy->id,
                        ! empty($validated['rent_bill_id']) ? (int) $validated['rent_bill_id'] : null,
                        false // Not required - allows payments without bill
                    );
                    $rentBillId = $billLinkResult['rent_bill_id'];
                    $rentBillError = $billLinkResult['error'];
                }

                // Create payment
                $paymentData = [
                    'tenant_id' => $tenant->id,
                    'tenancy_id' => $activeTenancy->id,
                    'rent_bill_id' => $rentBillId,
                    'amount' => $validated['amount'],
                    'payment_type' => $validated['payment_type'],
                    'payment_method' => $validated['payment_method'],
                    'status' => $status,
                    'paid_at' => now(),
                    'reference_number' => $validated['reference_number'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                ];

                // Link to utility bill if provided
                if ($validated['payment_type'] === 'utility' && ! empty($validated['utility_bill_id'])) {
                    $utilityBill = UtilityBill::with('tenancyUtility.tenancy.unit.property')
                        ->find($validated['utility_bill_id']);

                    // Verify the bill exists and belongs to this tenant's tenancy
                    if (! $utilityBill) {
                        return response()->json([
                            'error' => 'Utility bill not found.',
                        ], 422);
                    }

                    if ($utilityBill->tenancyUtility->tenancy_id !== $activeTenancy->id) {
                        return response()->json([
                            'error' => 'This utility bill does not belong to your active tenancy.',
                        ], 422);
                    }

                    // Verify the bill is payable (not already paid or waived)
                    if (in_array($utilityBill->status, ['paid', 'waived'])) {
                        return response()->json([
                            'error' => 'This utility bill has already been '.$utilityBill->status.'.',
                        ], 422);
                    }

                    $paymentData['utility_bill_id'] = $utilityBill->id;

                    // Process the utility bill payment
                    try {
                        app(UtilityService::class)->processUtilityPayment($utilityBill, $validated['amount']);
                    } catch (\InvalidArgumentException $e) {
                        return response()->json(['error' => $e->getMessage()], 422);
                    }

                    // Sync payment status with utility bill status
                    // Refresh the utility bill to get the updated status
                    $utilityBill->refresh();
                    $paymentData['status'] = $utilityBill->status;

                    // Validate the synced status is allowed
                    if (! in_array($paymentData['status'], ['paid', 'partial', 'overdue', 'pending'])) {
                        Log::warning('Unexpected utility bill status after payment', [
                            'utility_bill_id' => $utilityBill->id,
                            'status' => $paymentData['status'],
                        ]);
                        $paymentData['status'] = 'partial'; // Safe fallback
                    }
                }

                // Create payment with transactional rent bill processing
                $payment = null;
                $rentBillWarning = null;

                if ($validated['payment_type'] === 'rent' && $rentBillId) {
                    try {
                        // Use transactional service method for atomic payment + rent bill update
                        $payment = app(RentBillService::class)->createPaymentWithRentBill(
                            $paymentData,
                            $rentBillId,
                            $validated['amount']
                        );
                    } catch (\InvalidArgumentException $e) {
                        // Bill already processed, continue with payment but warn
                        $rentBillWarning = $e->getMessage();
                        $payment = Payment::create($paymentData);
                        Log::warning('Rent bill payment processing skipped', [
                            'rent_bill_id' => $rentBillId,
                            'error' => $e->getMessage(),
                        ]);
                    }
                } else {
                    // No rent bill linked - create payment normally
                    $payment = Payment::create($paymentData);
                }

                Log::info('Payment created via API by tenant', [
                    'payment_id' => $payment->id,
                    'tenant_id' => $tenant->id,
                    'amount' => $validated['amount'],
                    'status' => $status,
                ]);

                return ['success' => true, 'payment' => $payment, 'excessAmount' => $excessAmount];
            });

            // Handle duplicate payment response
            if (isset($result['error'])) {
                return response()->json([
                    'error' => $result['error'],
                ], 422);
            }

            // Include warning if rent bill was not found/linked properly
            $response = [
                'success' => true,
                'message' => 'Payment processed successfully!',
                'payment' => $result['payment'],
                'excessAmount' => $result['excessAmount'] ?? 0,
            ];

            if (! empty($rentBillWarning)) {
                $response['warning'] = $rentBillWarning;
            }

            if (! empty($rentBillError)) {
                $response['rent_bill_warning'] = $rentBillError;
            }

            return response()->json($response, 201);

        } catch (\Exception $e) {
            Log::error('Failed to process payment via API', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to process payment. Please try again.',
            ], 500);
        }
    }
}
