<?php

namespace App\Http\Controllers\Api\Tenant;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Payment;
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
    public function store(Request $request, \App\Services\PaymentService $paymentService)
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

        if (!$activeTenancy) {
            return response()->json([
                'error' => 'No active tenancy found.',
            ], 422);
        }

        try {
            $result = $paymentService->processPayment($validated, $activeTenancy);

            $response = [
                'success' => true,
                'message' => 'Payment processed successfully!',
                'payment' => new \App\Http\Resources\PaymentResource($result['payment']),
            ];
            
            if (!empty($result['warning'])) {
                $response['warning'] = $result['warning'];
            }
            
            return response()->json($response, 201);

        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to process payment via API', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get the receipt URL for a payment.
     */
    public function receipt(Request $request, $id, \App\Services\ReceiptService $receiptService)
    {
        $tenant = $request->user()->tenant;
        
        $payment = Payment::where('id', $id)
            ->where('tenant_id', $tenant->id)
            ->first();

        if (!$payment) {
            return response()->json(['error' => 'Payment not found or unauthorized.'], 404);
        }

        if (!$payment->receipt_path) {
            // Generate it on the fly if it doesn't exist yet but is paid
            if ($payment->status === 'paid' || $payment->status === 'partial') {
                try {
                    $receiptService->generate($payment);
                    $payment->refresh();
                } catch (\Exception $e) {
                    Log::error("Failed generating receipt on the fly for {$payment->id}: " . $e->getMessage());
                    return response()->json(['error' => 'Failed to generate receipt.'], 500);
                }
            } else {
                return response()->json(['error' => 'Receipt not available for unpaid payments.'], 400);
            }
        }

        $url = $receiptService->getUrl($payment);

        if (!$url) {
            return response()->json(['error' => 'Unable to retrieve receipt url.'], 500);
        }

        return response()->json(['url' => $url]);
    }
}
