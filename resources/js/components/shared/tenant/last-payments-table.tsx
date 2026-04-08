import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface Payment {
    id: number;
    amount: number;
    payment_type: string;
    payment_method: string;
    status?: string;
    paid_at: string | null;
    created_at: string;
}

interface LastPaymentsTableProps {
    payments?: Payment[];
}

const formatDate = (dateString: string | null) => {
    if (!dateString) return { day: '?', month: '?', time: '?' };
    const date = new Date(dateString);
    return {
        day: date.getDate(),
        month: date.toLocaleString('en-US', { month: 'short' }),
        time: date.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        }),
    };
};

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'TZS',
        minimumFractionDigits: 0,
    }).format(amount);

const getPaymentLabel = (payment: Payment) => {
    const typeLabel =
        payment.payment_type.charAt(0).toUpperCase() +
        payment.payment_type.slice(1);
    return `${typeLabel} · ${payment.payment_method}`;
};

const statusVariant = (
    status?: string,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status?.toLowerCase()) {
        case 'paid':
            return 'default';
        case 'pending':
            return 'secondary';
        case 'failed':
            return 'destructive';
        default:
            return 'outline';
    }
};

export function LastPaymentsTable({ payments = [] }: LastPaymentsTableProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">
                    Recent Payments
                </CardTitle>
                <Link
                    href={route('tenant.payments')}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                    See all
                </Link>
            </CardHeader>
            <CardContent>
                {payments.length === 0 ? (
                    <p className="text-muted-foreground py-6 text-center text-sm">
                        No transactions yet
                    </p>
                ) : (
                    <div className="space-y-3">
                        {payments.map((payment) => {
                            const { day, month, time } = formatDate(
                                payment.paid_at || payment.created_at,
                            );
                            return (
                                <div
                                    key={payment.id}
                                    className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-muted rounded-lg px-3 py-2 text-center text-xs">
                                            <div className="font-semibold">
                                                {day} {month}
                                            </div>
                                            <div className="text-muted-foreground">
                                                {time}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold">
                                                {formatCurrency(payment.amount)}
                                            </div>
                                            <div className="text-muted-foreground text-xs">
                                                {getPaymentLabel(payment)}
                                            </div>
                                        </div>
                                    </div>
                                    {payment.status && (
                                        <Badge
                                            variant={statusVariant(
                                                payment.status,
                                            )}
                                        >
                                            {payment.status}
                                        </Badge>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
