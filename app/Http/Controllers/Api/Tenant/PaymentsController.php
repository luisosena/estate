<?php

namespace App\Http\Controllers\Api\Tenant;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Tenancy;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $tenant = $user->tenant;

        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->with(['payments'])
            ->first();

        $payments = $activeTenancy?->payments
            ->sortByDesc('paid_at')
            ->values() ?? collect();

        // Calculate pending amount
        $pendingAmount = 0;
        $monthlyRent = 0;
        if ($activeTenancy) {
            $monthlyRent = $activeTenancy->monthly_rent ?? 0;
            // Only consider rent payments for pending amount calculation
            $totalPaid = $activeTenancy->payments()
                ->whereIn('status', ['paid', 'partial'])
                ->where('payment_type', 'rent')
                ->sum('amount');
            $pendingAmount = max(0, $monthlyRent - $totalPaid);
        }

        return response()->json([
            'tenant' => [
                'id' => $tenant->id,
                'full_name' => $tenant->full_name,
                'phone' => $tenant->phone,
                'email' => $tenant->email,
            ],
            'tenancy' => $activeTenancy ? [
                'id' => $activeTenancy->id,
                'monthly_rent' => $monthlyRent,
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
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->first();

        if (!$activeTenancy) {
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
                if (!$lockedTenancy) {
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

                // Determine status for this payment
                $status = 'partial';
                if ($validated['payment_type'] !== 'rent') {
                    $status = 'pending'; // Utility payments start as pending until approved
                } elseif ($newTotalPaid >= $monthlyRent) {
                    $status = 'paid';
                }

                // Create payment
                $payment = Payment::create([
                    'tenant_id' => $tenant->id,
                    'tenancy_id' => $activeTenancy->id,
                    'amount' => $validated['amount'],
                    'payment_type' => $validated['payment_type'],
                    'payment_method' => $validated['payment_method'],
                    'status' => $status,
                    'paid_at' => now(),
                    'reference_number' => $validated['reference_number'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                ]);

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

            return response()->json([
                'success' => true,
                'message' => 'Payment processed successfully!',
                'payment' => $result['payment'],
                'excessAmount' => $result['excessAmount'] ?? 0,
            ], 201);

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
