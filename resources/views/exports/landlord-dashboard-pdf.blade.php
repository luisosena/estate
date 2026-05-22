<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Landlord Dashboard Report</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1a1a1a; margin: 0; padding: 20px; }
        h1 { font-size: 20px; margin-bottom: 4px; }
        h2 { font-size: 14px; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
        .meta { color: #6b7280; font-size: 10px; margin-bottom: 16px; }
        .stats { margin-bottom: 16px; }
        .stat { display: inline-block; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 14px; min-width: 140px; margin: 0 8px 8px 0; vertical-align: top; }
        .stat-label { font-size: 9px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em; }
        .stat-value { font-size: 18px; font-weight: 700; margin-top: 2px; }
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
    <h1>Landlord Dashboard Report</h1>
    <div class="meta">Generated: {{ $exportedAt->format('M d, Y H:i') }} | Landlord: {{ $landlord->name }}</div>

    <h2>Portfolio Summary</h2>
    <div class="stats">
        <div class="stat">
            <div class="stat-label">Properties</div>
            <div class="stat-value">{{ $stats['total_properties'] }}</div>
        </div>
        <div class="stat">
            <div class="stat-label">Total Units</div>
            <div class="stat-value">{{ $stats['total_units'] }}</div>
        </div>
        <div class="stat">
            <div class="stat-label">Occupied</div>
            <div class="stat-value">{{ $stats['occupied_units'] }}</div>
        </div>
        <div class="stat">
            <div class="stat-label">Vacant</div>
            <div class="stat-value">{{ $stats['vacant_units'] }}</div>
        </div>
        <div class="stat">
            <div class="stat-label">Tenants</div>
            <div class="stat-value">{{ $stats['total_tenants'] }}</div>
        </div>
        <div class="stat">
            <div class="stat-label">Monthly Revenue</div>
            <div class="stat-value">{{ number_format($stats['monthly_revenue'], 0) }} TZS</div>
        </div>
    </div>

    <h2>Financial Overview</h2>
    <div class="stats">
        <div class="stat">
            <div class="stat-label">Pending Bills</div>
            <div class="stat-value">{{ $stats['pending_rent_bills'] }}</div>
        </div>
        <div class="stat">
            <div class="stat-label">Overdue Bills</div>
            <div class="stat-value">{{ $stats['overdue_rent_bills'] }}</div>
        </div>
        <div class="stat">
            <div class="stat-label">Outstanding</div>
            <div class="stat-value">{{ number_format($stats['total_rent_outstanding'], 0) }} TZS</div>
        </div>
    </div>

    <h2>Properties</h2>
    <table>
        <thead>
            <tr><th>Name</th><th>Address</th><th>Units</th><th>Tenants</th></tr>
        </thead>
        <tbody>
            @foreach($properties as $property)
            <tr>
                <td>{{ $property->name }}</td>
                <td>{{ $property->address ?? '—' }}</td>
                <td>{{ $property->units_count }}</td>
                <td>{{ $property->active_tenants_count }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    @if($recentPayments->count() > 0)
    <h2>Recent Payments</h2>
    <table>
        <thead>
            <tr><th>Date</th><th>Tenant</th><th>Unit</th><th>Amount</th><th>Status</th></tr>
        </thead>
        <tbody>
            @foreach($recentPayments as $payment)
            <tr>
                <td>{{ $payment->paid_at?->format('M d, Y') ?? '—' }}</td>
                <td>{{ $payment->tenant?->full_name ?? '—' }}</td>
                <td>{{ $payment->tenancy?->unit?->unit_code ?? '—' }}</td>
                <td>{{ number_format($payment->amount, 0) }} TZS</td>
                <td><span class="badge badge-{{ $payment->status->value }}">{{ ucfirst($payment->status->value) }}</span></td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <div class="footer">Estate Practice — Dashboard Report</div>
</body>
</html>
