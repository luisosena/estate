<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Tenant;
use App\Models\Tenancy;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class LandlordPaymentController extends Controller
{
    /**
     * Store a new payment record for a tenant.
     *
     * @param Request $request
     * @param Tenant $tenant
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request, Tenant $tenant)
    {
        $landlord = $request->user();
        
        // Authorization: ensure tenant belongs to landlord's property
        $hasAccess = $tenant->tenancies()
            ->whereHas('unit.property', function ($query) use ($landlord) {
                $query->where('owner_id', $landlord->id);
            })
            ->exists();

        if (!$hasAccess) {
            abort(403, 'You do not have access to add payments for this tenant.');
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_type' => ['required', Rule::in(['rent', 'utility'])],
            'payment_method' => 'required|string|max:255',
            'status' => ['required', Rule::in(['paid', 'partial', 'overdue', 'pending'])],
            'paid_at' => 'required|date',
        ]);

        try {
            // Get the active tenancy for this tenant
            $activeTenancy = $tenant->tenancies()->where('status', 'active')->first();
            
            if (!$activeTenancy) {
                return redirect()
                    ->back()
                    ->with('error', 'This tenant has no active tenancy.');
            }

            // Create the payment record
            $payment = Payment::create([
                'tenant_id' => $tenant->id,
                'tenancy_id' => $activeTenancy->id,
                'amount' => $validated['amount'],
                'payment_type' => $validated['payment_type'],
                'payment_method' => $validated['payment_method'],
                'status' => $validated['status'],
                'paid_at' => $validated['paid_at'],
            ]);

            Log::info('Payment record created', [
                'payment_id' => $payment->id,
                'tenant_id' => $tenant->id,
                'amount' => $validated['amount'],
                'landlord_id' => $landlord->id,
            ]);

            return redirect()
                ->route('landlord.tenants.show', ['tenant' => $tenant->tenant_code])
                ->with('success', 'Payment record added successfully.');

        } catch (\Exception $e) {
            Log::error('Failed to create payment record', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
                'validated_data' => $validated,
            ]);

            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to add payment record. Please try again.');
        }
    }

    /**
     * Update an existing payment record.
     *
     * @param Request $request
     * @param Payment $payment
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Payment $payment)
    {
        $landlord = $request->user();
        
        // Authorization: ensure payment belongs to landlord's tenant
        $hasAccess = $payment->tenant()
            ->whereHas('tenancies.unit.property', function ($query) use ($landlord) {
                $query->where('owner_id', $landlord->id);
            })
            ->exists();

        if (!$hasAccess) {
            abort(403, 'You do not have access to edit this payment record.');
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_type' => ['required', Rule::in(['rent', 'utility'])],
            'payment_method' => 'required|string|max:255',
            'status' => ['required', Rule::in(['paid', 'partial', 'overdue', 'pending'])],
            'paid_at' => 'required|date',
        ]);

        try {
            $payment->update($validated);

            Log::info('Payment record updated', [
                'payment_id' => $payment->id,
                'tenant_id' => $payment->tenant_id,
                'amount' => $validated['amount'],
                'landlord_id' => $landlord->id,
            ]);

            return redirect()
                ->route('landlord.tenants.show', ['tenant' => $payment->tenant->tenant_code])
                ->with('success', 'Payment record updated successfully.');

        } catch (\Exception $e) {
            Log::error('Failed to update payment record', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
                'validated_data' => $validated,
            ]);

            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to update payment record. Please try again.');
        }
    }

    /**
     * Delete a payment record.
     *
     * @param Request $request
     * @param Payment $payment
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Request $request, Payment $payment)
    {
        $landlord = $request->user();
        
        // Authorization: ensure payment belongs to landlord's tenant
        $hasAccess = $payment->tenant()
            ->whereHas('tenancies.unit.property', function ($query) use ($landlord) {
                $query->where('owner_id', $landlord->id);
            })
            ->exists();

        if (!$hasAccess) {
            abort(403, 'You do not have access to delete this payment record.');
        }

        try {
            $tenantCode = $payment->tenant->tenant_code;
            $payment->delete();

            Log::info('Payment record deleted', [
                'payment_id' => $payment->id,
                'tenant_id' => $payment->tenant_id,
                'landlord_id' => $landlord->id,
            ]);

            return redirect()
                ->route('landlord.tenants.show', ['tenant' => $tenantCode])
                ->with('success', 'Payment record deleted successfully.');

        } catch (\Exception $e) {
            Log::error('Failed to delete payment record', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()
                ->back()
                ->with('error', 'Failed to delete payment record. Please try again.');
        }
    }
}
