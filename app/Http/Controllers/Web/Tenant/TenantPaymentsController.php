<?php

namespace App\Http\Controllers\Web\Tenant;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Tenancy;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\UtilityService;
use App\Models\UtilityBill;

class TenantPaymentsController extends Controller
{
  protected $utilityService;

  public function __construct(UtilityService $utilityService)
  {
    $this->utilityService = $utilityService;
  }
  public function index(Request $request)
  {
    $user = $request->user();
    $tenant = $user->tenant;

    $activeTenancy = $tenant->tenancies()
      ->where('status', 'active')
      ->with(['payments'])
      ->first();

    $payments = $activeTenancy?->payments()
      ->orderByDesc('paid_at')
      ->get() ?? collect();

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

    return Inertia::render('tenant/payments', [
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
   * Show the make payment page.
   */
  public function makePayment(Request $request, ?int $paymentId = null)
  {
    $user = $request->user();
    $tenant = $user->tenant;

    $activeTenancy = $tenant->tenancies()
      ->where('status', 'active')
      ->with(['payments'])
      ->first();

    if (!$activeTenancy) {
      return redirect()
        ->route('tenant.payments')
        ->with('error', 'No active tenancy found.');
    }

    $existingPayment = null;
    if ($paymentId) {
      $existingPayment = $activeTenancy->payments()->find($paymentId);
    }

    // Calculate pending amount - only consider rent payments
    $monthlyRent = $activeTenancy->monthly_rent ?? 0;
    $totalPaid = $activeTenancy->payments()
      ->whereIn('status', ['paid', 'partial'])
      ->where('payment_type', 'rent')
      ->sum('amount');
    $pendingAmount = max(0, $monthlyRent - $totalPaid);

    // Fetch pending utility bills for this tenancy
    $pendingUtilityBills = [];
    if ($activeTenancy) {
      $pendingUtilityBills = UtilityBill::whereHas('tenancyUtility', function ($q) use ($activeTenancy) {
          $q->where('tenancy_id', $activeTenancy->id);
        })
        ->whereIn('status', ['pending', 'partial', 'overdue'])
        ->with('tenancyUtility.utilityType')
        ->orderBy('due_date', 'asc')
        ->get();
    }

    return Inertia::render('tenant/payments/make', [
      'tenant' => [
        'id' => $tenant->id,
        'full_name' => $tenant->full_name,
        'phone' => $tenant->phone,
        'email' => $tenant->email,
      ],
      'tenancy' => [
        'id' => $activeTenancy->id,
        'monthly_rent' => $monthlyRent,
      ],
      'existingPayment' => $existingPayment,
      'pendingAmount' => $pendingAmount,
      'pendingUtilityBills' => $pendingUtilityBills,
      'paymentMethods' => [
        ['value' => 'mobile_money', 'label' => 'Mobile Money'],
        ['value' => 'bank_transfer', 'label' => 'Bank Transfer'],
      ],
    ]);
  }

  /**
   * Store a new payment or update existing.
   */
  public function storePayment(Request $request, ?Payment $payment = null)
  {
    $user = $request->user();
    $tenant = $user->tenant;

    $validated = $request->validate([
      'amount' => 'required|numeric|min:1|max:100000000',
      'payment_type' => 'required|in:rent,utility',
      'payment_method' => 'required|in:mobile_money,bank_transfer',
      'reference_number' => 'nullable|string|max:100',
      'notes' => 'nullable|string|max:500',
      'utility_bill_id' => 'nullable|exists:utility_bills,id',
    ]);

    $activeTenancy = $tenant->tenancies()
      ->where('status', 'active')
      ->first();

    if (!$activeTenancy) {
      return redirect()
        ->route('tenant.payments')
        ->with('error', 'No active tenancy found.');
    }

    // Get the existing payment if updating (from route model binding)
    $existingPayment = $payment;

    // Security: Verify payment ownership if updating
    if ($existingPayment) {
      // Ensure the payment belongs to this tenant's tenancy
      if ($existingPayment->tenant_id !== $tenant->id) {
        Log::warning('Payment ownership violation attempt', [
          'payment_id' => $existingPayment->id,
          'tenant_id' => $tenant->id,
          'payment_tenant_id' => $existingPayment->tenant_id,
        ]);
        abort(403, 'Unauthorized access to this payment.');
      }
    }

    try {
      // Use DB transaction with row locking to prevent race conditions
      $result = DB::transaction(function () use ($activeTenancy, $validated, $existingPayment, $tenant) {
        // Lock the tenancy's payments for update to prevent concurrent modifications
        $lockedPayments = $activeTenancy->payments()
          ->lockForUpdate()
          ->get();

        // Duplicate Payment Prevention: Check for recent duplicate payments
        // Reject payments submitted within 30 seconds with same amount and method
        $recentDuplicate = $activeTenancy->payments()
          ->where('amount', $validated['amount'])
          ->where('payment_method', $validated['payment_method'])
          ->where('payment_type', $validated['payment_type'])
          ->where('created_at', '>=', now()->subSeconds(30))
          ->exists();

        if ($recentDuplicate && !$existingPayment) {
          return ['error' => 'A duplicate payment was recently submitted. Please wait a moment and try again.'];
        }

        // Calculate status based on total paid vs monthly rent
        // Match model logic: filter by payment_type = 'rent' by default
        $monthlyRent = $activeTenancy->monthly_rent ?? 0;
        $query = $activeTenancy->payments()
          ->whereIn('status', ['paid', 'partial'])
          ->where('payment_type', 'rent');

        // Exclude the existing payment being updated from the sum
        if ($existingPayment) {
          $query->where('id', '!=', $existingPayment->id);
        }

        $currentTotalPaid = $query->sum('amount');
        $newTotalPaid = $currentTotalPaid + $validated['amount'];

        // Determine status for this payment
        $status = 'partial';
        $utilityBillId = $validated['utility_bill_id'] ?? null;

        if ($validated['payment_type'] === 'utility' && $utilityBillId) {
          $bill = UtilityBill::find($utilityBillId);
          if ($bill) {
            // Reconcile the utility bill using the service
            $this->utilityService->processUtilityPayment($bill, $validated['amount']);
            
            // Set payment status based on bill status (source of truth)
            $bill->refresh();
            $status = $bill->status;
          }
        } else if ($validated['payment_type'] === 'rent') {
          if ($newTotalPaid >= $monthlyRent) {
            $status = 'paid';
          }
        }

        // Create or update payment
        if ($existingPayment) {
          $existingPayment->update([
            'amount' => $validated['amount'],
            'payment_type' => $validated['payment_type'],
            'payment_method' => $validated['payment_method'],
            'utility_bill_id' => $utilityBillId,
            'status' => $status,
            'paid_at' => now(),
            'reference_number' => $validated['reference_number'] ?? null,
            'notes' => $validated['notes'] ?? null,
          ]);
          $payment = $existingPayment;

          Log::info('Payment updated by tenant', [
            'payment_id' => $payment->id,
            'tenant_id' => $tenant->id,
            'amount' => $validated['amount'],
            'status' => $status,
          ]);
        } else {
          $payment = Payment::create([
            'tenant_id' => $tenant->id,
            'tenancy_id' => $activeTenancy->id,
            'utility_bill_id' => $utilityBillId,
            'amount' => $validated['amount'],
            'payment_type' => $validated['payment_type'],
            'payment_method' => $validated['payment_method'],
            'status' => $status,
            'paid_at' => now(),
            'reference_number' => $validated['reference_number'] ?? null,
            'notes' => $validated['notes'] ?? null,
          ]);

          Log::info('Payment created by tenant', [
            'payment_id' => $payment->id,
            'tenant_id' => $tenant->id,
            'amount' => $validated['amount'],
            'status' => $status,
          ]);
        }

        return ['success' => true, 'payment' => $payment];
      });

      // Handle duplicate payment response
      if (isset($result['error'])) {
        return redirect()
          ->back()
          ->withInput()
          ->with('error', $result['error']);
      }

      return redirect()
        ->route('tenant.payments')
        ->with('success', 'Payment processed successfully!');

    } catch (\Exception $e) {
      Log::error('Failed to process payment', [
        'tenant_id' => $tenant->id,
        'payment_id' => $existingPayment?->id,
        'is_update' => $existingPayment !== null,
        'error' => $e->getMessage(),
      ]);

      return redirect()
        ->back()
        ->withInput()
        ->with('error', 'Failed to process payment. Please try again.');
    }
  }
}
