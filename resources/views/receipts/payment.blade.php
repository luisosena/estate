<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Receipt</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .receipt-container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 40px;
        }
        .header h1 {
            color: #1a1a1a;
            margin: 0;
            font-size: 32px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .details-section {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }
        .details-col {
            display: table-cell;
            width: 50%;
        }
        .details-title {
            font-weight: bold;
            text-transform: uppercase;
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }
        .details-data {
            margin-bottom: 5px;
        }
        table.items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table th {
            text-align: left;
            background-color: #f8f9fa;
            padding: 12px;
            border-bottom: 2px solid #dee2e6;
            color: #495057;
        }
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #dee2e6;
        }
        .amount-col {
            text-align: right;
        }
        .total-row {
            font-weight: bold;
            font-size: 18px;
        }
        .total-row td {
            border-top: 2px solid #333;
            padding-top: 15px;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #888;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            background-color: #e6f4ea;
            color: #137333;
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="header">
            <h1>Official Receipt</h1>
            <p>Estate Practice System</p>
            <p>Receipt #: {{ str_pad($payment->id, 8, '0', STR_PAD_LEFT) }}</p>
            <p>Date: {{ $payment->paid_at ? \Carbon\Carbon::parse($payment->paid_at)->format('F j, Y g:i A') : $payment->created_at->format('F j, Y g:i A') }}</p>
        </div>

        <div class="details-section">
            <div class="details-col">
                <div class="details-title">Received From:</div>
                <div class="details-data"><strong>{{ $payment->tenant?->full_name ?? 'N/A' }}</strong></div>
                <div class="details-data">Tenant Code: {{ $payment->tenant?->tenant_code ?? 'N/A' }}</div>
                <div class="details-data">Unit: {{ $payment->tenancy?->unit?->unit_code ?? 'N/A' }}</div>
                <div class="details-data">Property: {{ $payment->tenancy?->unit?->property?->name ?? 'N/A' }}</div>
            </div>
            <div class="details-col" style="text-align: right;">
                <div class="details-title">Payment Info:</div>
                <div class="details-data">Method: {{ ucfirst(str_replace('_', ' ', $payment->payment_method)) }}</div>
                <div class="details-data">Gateway Ref: {{ $payment->gateway_reference ?? $payment->reference_number ?? 'N/A' }}</div>
                <div class="details-data" style="margin-top: 10px;">
                    Status: <span class="badge">{{ $payment->status }}</span>
                </div>
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Type</th>
                    <th class="amount-col">Amount Paid (KES)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        @if($payment->payment_type === 'rent')
                            Rent Payment 
                            @if($payment->rentBill && $payment->rentBill->billing_month)
                                for {{ $payment->rentBill->billing_month->format('F Y') }}
                            @endif
                        @elseif($payment->payment_type === 'utility')
                            Utility Payment
                            @if($payment->utilityBill)
                                - {{ $payment->utilityBill->tenancyUtility->utilityType->name ?? 'Utility' }}
                            @endif
                        @endif

                        @if($payment->notes)
                            <br><small style="color: #666;">Note: {{ $payment->notes }}</small>
                        @endif
                    </td>
                    <td>{{ ucfirst($payment->payment_type) }}</td>
                    <td class="amount-col">{{ number_format($payment->amount, 2) }}</td>
                </tr>
                <tr class="total-row">
                    <td colspan="2" style="text-align: right;">Total Amount Received:</td>
                    <td class="amount-col">{{ number_format($payment->amount, 2) }}</td>
                </tr>
            </tbody>
        </table>

        <div class="footer">
            <p>This is an electronically generated receipt and does not require a physical signature.</p>
            <p>&copy; {{ date('Y') }} Estate Practice. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
