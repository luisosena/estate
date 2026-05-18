import { Link } from '@inertiajs/react';
import {
    Building2,
    CheckCircle,
    CreditCard,
    ShieldCheck,
    Users,
    ArrowLeft,
} from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface AuditLandlord {
    id: number;
    name: string;
    email: string;
    role: string;
    email_verified_at: string | null;
    created_at: string;
}

interface AuditProperty {
    id: number;
    name: string;
    address: string | null;
    status: string;
    landlord: { name: string };
    created_at: string;
}

interface AuditTenancy {
    id: number;
    status: string;
    monthly_rent: number;
    tenant: { full_name: string };
    unit: { unit_code: string };
    created_at: string;
}

interface AuditPayment {
    id: number;
    amount: number;
    status: string;
    payment_type: string;
    tenant: { full_name: string };
    tenancy: { unit: { unit_code: string } };
    created_at: string;
}

interface AuditReportsProps {
    recentLandlords: AuditLandlord[];
    recentProperties: AuditProperty[];
    recentTenancies: AuditTenancy[];
    recentPayments: AuditPayment[];
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'TZS',
        minimumFractionDigits: 0,
    }).format(amount);

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
        active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        maintenance: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        available: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        occupied: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return (
        <Badge className={`text-xs ${variants[status] ?? 'bg-gray-100 text-gray-800'}`}>
            {status}
        </Badge>
    );
};

export default function AuditReports({
    recentLandlords,
    recentProperties,
    recentTenancies,
    recentPayments,
}: AuditReportsProps) {
    return (
        <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <Button asChild variant="ghost" size="sm" className="mb-2">
                        <Link href={route('admin.dashboard')}>
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
                            <ShieldCheck className="w-3 h-3" />
                            Audit Trail
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                        Audit Reports
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        System-wide activity log and registration audit trail.
                    </p>
                </div>
            </header>

            <Separator className="opacity-50" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            Recent Landlord Registrations
                        </CardTitle>
                        <CardDescription>Last 20 landlord accounts created</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {recentLandlords.map((landlord) => (
                                <div key={landlord.id} className="flex items-center justify-between p-4">
                                    <div>
                                        <p className="text-sm font-medium">{landlord.name}</p>
                                        <p className="text-xs text-muted-foreground">{landlord.email}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {landlord.email_verified_at ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Badge className="text-xs bg-yellow-100 text-yellow-800">Unverified</Badge>
                                        )}
                                        <span className="text-xs text-muted-foreground">{formatDate(landlord.created_at)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-primary" />
                            Recent Property Registrations
                        </CardTitle>
                        <CardDescription>Last 20 properties added to the system</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {recentProperties.map((property) => (
                                <div key={property.id} className="flex items-center justify-between p-4">
                                    <div>
                                        <p className="text-sm font-medium">{property.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {property.address ?? 'No address'} — {property.landlord?.name}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {statusBadge(property.status)}
                                        <span className="text-xs text-muted-foreground">{formatDate(property.created_at)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                            Recent Tenancies
                        </CardTitle>
                        <CardDescription>Last 20 tenancy agreements created</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {recentTenancies.map((tenancy) => (
                                <div key={tenancy.id} className="flex items-center justify-between p-4">
                                    <div>
                                        <p className="text-sm font-medium">{tenancy.tenant?.full_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Unit {tenancy.unit?.unit_code} — {formatCurrency(tenancy.monthly_rent)}/mo
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {statusBadge(tenancy.status)}
                                        <span className="text-xs text-muted-foreground">{formatDate(tenancy.created_at)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-primary" />
                            Recent Payments
                        </CardTitle>
                        <CardDescription>Last 20 payment transactions</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {recentPayments.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between p-4">
                                    <div>
                                        <p className="text-sm font-medium">{payment.tenant?.full_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Unit {payment.tenancy?.unit?.unit_code} — {payment.payment_type}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-semibold">{formatCurrency(payment.amount)}</span>
                                        {statusBadge(payment.status)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}

AuditReports.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
