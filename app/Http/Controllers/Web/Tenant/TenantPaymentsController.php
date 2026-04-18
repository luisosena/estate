<?php

namespace App\Http\Controllers\Web\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StorePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Http\Resources\TenancyResource;
use App\Http\Resources\TenantResource;
use App\Http\Resources\UtilityBillResource;
use App\Models\Payment;
use App\Models\UtilityBill;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class TenantPaymentsController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Display a listing of payments for the tenant.
     */
    public function index(Request $request)
    {
        $tenant = $request->user()->tenant;

        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->first();

        $payments = $activeTenancy 
            ? $activeTenancy->payments()->orderByDesc('paid_at')->paginate(15) 
            : collect([]);

        return Inertia::render('tenant/payments', [
            'tenant' => new TenantResource($tenant),
            'tenancy' => $activeTenancy ? new TenancyResource($activeTenancy) : null,
            'payments' => $activeTenancy ? PaymentResource::collection($payments) : null,
            'pendingAmount' => $this->paymentService->calculatePendingRent($activeTenancy),
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
            ->first();

        if (! $activeTenancy) {
            return redirect()
                ->route('tenant.payments')
                ->with('error', 'No active tenancy found.');
        }

        $existingPayment = null;
        if ($paymentId) {
            $existingPayment = $activeTenancy->payments()->findOrFail($paymentId);
            $this->authorize('view', $existingPayment);
        }

        // Fetch pending utility bills
        $pendingUtilityBills = UtilityBill::whereHas('tenancyUtility', function ($q) use ($activeTenancy) {
            $q->where('tenancy_id', $activeTenancy->id);
        })
            ->whereIn('status', ['pending', 'partial', 'overdue'])
            ->with('tenancyUtility.utilityType')
            ->orderBy('due_date', 'asc')
            ->get();

        return Inertia::render('tenant/payments/make', [
            'tenant' => new TenantResource($tenant),
            'tenancy' => new TenancyResource($activeTenancy),
            'existingPayment' => $existingPayment ? new PaymentResource($existingPayment) : null,
            'pendingAmount' => $this->paymentService->calculatePendingRent($activeTenancy),
            'pendingUtilityBills' => UtilityBillResource::collection($pendingUtilityBills),
            'paymentMethods' => [
                ['value' => 'mobile_money', 'label' => 'Mobile Money'],
                ['value' => 'bank_transfer', 'label' => 'Bank Transfer'],
            ],
        ]);
    }

    /**
     * Store a new payment or update existing.
     */
    public function storePayment(StorePaymentRequest $request, ?Payment $payment = null)
    {
        $user = $request->user();
        $tenant = $user->tenant;
        $validated = $request->validated();

        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->first();

        if (! $activeTenancy) {
            return redirect()
                ->route('tenant.payments')
                ->with('error', 'No active tenancy found.');
        }

        // Security check
        if ($payment) {
            $this->authorize('update', $payment);
        }

        try {
            $result = $this->paymentService->processPayment($validated, $activeTenancy, $payment);

            if (isset($result['error'])) {
                return redirect()->back()->withInput()->with('error', $result['error']);
            }

            return redirect()
                ->route('tenant.payments')
                ->with('success', 'Payment processed successfully!');

        } catch (\Exception $e) {
            Log::error('Payment processing failed: '.$e->getMessage());

            return redirect()->back()->withInput()->with('error', 'Failed to process payment.');
        }
    }
}
