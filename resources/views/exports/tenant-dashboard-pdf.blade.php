<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Tenant Dashboard Report</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1a1a1a; margin: 0; padding: 20px; }
        h1 { font-size: 20px; margin-bottom: 4px; }
        h2 { font-size: 14px; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
        .meta { color: #6b7280; font-size: 10px; margin-bottom: 16px; }
        .info-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
        .info-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 14px; min-width: 140px; }
        .info-label { font-size: 9px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em; }
        .info-value { font-size: 14px; font-weight: 600; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { background: #f3f4f6; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; padding: 6px 8px; border-bottom: 2px solid #e5e7eb; }
        td { padding: 6px 8px; border-bottom: 1px solid #f3f4f6; font-size: 11px; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 600; }
        .badge-paid { background: #dcfce7; color: #166534; }
        .badge-pending { background: #fef3c7; color: #92400e; }
        .badge-overdue { background: #fee2e2; color: #991b1b; }
        .badge-partial { background: #dbeafe; color: #1e40af; }
        .badge-waived { background: #f3f4f6; color: #374151; }
        .footer { margin-top: 30px; font-size: 9px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 10px; }
    </style>
</head>
<body>
    <h1>Tenant Dashboard Report</h1>
    <div class="meta">Generated: {{ $exportedAt->format('M d, Y H:i') }} | Tenant: {{ $tenant->full_name }}</div>

    <h2>Tenancy Details</h2>
    <div class="info-grid">
        <div class="info-item">
            <div class="info-label">Unit</div>
            <div class="info-value">{{ $unit?->unit_name ?? '—' }}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Unit Code</div>
            <div class="info-value">{{ $unit?->unit_code ?? '—' }}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Property</div>
            <div class="info-value">{{ $unit?->property?->name ?? '—' }}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Monthly Rent</div>
            <div class="info-value">{{ number_format($tenancy->monthly_rent, 0) }} TZS</div>
        </div>
        <div class="info-item">
            <div class="info-label">Move In</div>
            <div class="info-value">{{ $tenancy->move_in_date?->format('M d, Y') ?? '—' }}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Status</div>
            <div class="info-value">{{ ucfirst($tenancy->status) }}</div>
        </div>
    </div>

    @if($payments->count() > 0)
    <h2>Payment History</h2>
    <table>
        <thead>
            <tr><th>Date</th><th>Amount</th><th>Type</th><th>Method</th><th>Status</th></tr>
        </thead>
        <tbody>
            @foreach($payments as $payment)
            <tr>
                <td>{{ $payment->paid_at?->format('M d, Y') ?? '—' }}</td>
                <td>{{ number_format($payment->amount, 0) }} TZS</td>
                <td>{{ ucfirst($payment->payment_type ?? '—') }}</td>
                <td>{{ ucfirst($payment->payment_method ?? '—') }}</td>
                <td><span class="badge badge-{{ $payment->status }}">{{ ucfirst($payment->status) }}</span></td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    @if($rentBills->count() > 0)
    <h2>Rent Bills</h2>
    <table>
        <thead>
            <tr><th>Billing Month</th><th>Amount Due</th><th>Amount Paid</th><th>Balance</th><th>Status</th></tr>
        </thead>
        <tbody>
            @foreach($rentBills as $bill)
            <tr>
                <td>{{ $bill->billing_month?->format('M Y') ?? '—' }}</td>
                <td>{{ number_format($bill->amount_due, 0) }} TZS</td>
                <td>{{ number_format($bill->amount_paid, 0) }} TZS</td>
                <td>{{ number_format($bill->amount_due - $bill->amount_paid, 0) }} TZS</td>
                <td><span class="badge badge-{{ $bill->status }}">{{ ucfirst($bill->status) }}</span></td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <div class="footer">Estate Practice — Dashboard Report</div>
</body>
</html>
