import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface Payment {
    id: number;
    amount: number;
    payment_type: string;
    payment_method: string;
    paid_at: string | null;
    created_at: string;
}

interface LastPaymentsTableProps {
    payments?: Payment[];
}

export function LastPaymentsTable({ payments = [] }: LastPaymentsTableProps) {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return { day: '?', month: '?', time: '?' };

        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'short' });
        const time = date.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
        return { day, month, time };
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getPaymentLabel = (payment: Payment) => {
        const typeLabel =
            payment.payment_type.charAt(0).toUpperCase() +
            payment.payment_type.slice(1);
        return `${typeLabel} - ${payment.payment_method}`;
    };

    return (
        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                    Last Transactions
                </h2>
                <Link
                    href={route('tenant.payments')}
                    className="text-sm text-gray-600 hover:text-gray-900"
                >
                    See All
                </Link>
            </div>

            {payments.length === 0 ? (
                <p className="text-center text-gray-500">No transactions yet</p>
            ) : (
                <div className="space-y-4">
                    {payments.map((payment) => {
                        const { day, month, time } = formatDate(
                            payment.paid_at || payment.created_at,
                        );
                        return (
                            <div
                                key={payment.id}
                                className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-b-0"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="rounded-lg bg-gray-100 px-3 py-2 text-center text-xs">
                                        <div className="font-semibold text-gray-900">
                                            {day} {month}
                                        </div>
                                        <div className="text-gray-600">
                                            {time}
                                        </div>
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                        {formatCurrency(payment.amount)}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {getPaymentLabel(payment)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
