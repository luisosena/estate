import { LandlordSidebar } from '@/components/layout/landlord-sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Mail, Phone, Calendar, Home } from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface Payment {
    id: number;
    amount: number;
    paid_at?: string;
    created_at: string;
    method?: string;
}

interface Utility {
    id: number;
    name: string;
    amount: number;
    due_date: string;
    status: string;
}

interface Unit {
    id: number;
    unit_name: string;
    unit_code: string;
}

interface Tenancy {
    move_in_date: string;
    status: string;
}

interface Tenant {
    id: number;
    full_name: string;
    phone: string;
    email: string | null;
}

interface LandlordTenantViewProps {
    tenant: Tenant;
    unit?: Unit;
    tenancy?: Tenancy;
    payments: Payment[];
    utilities: Utility[];
    properties: any[];
}

const formatDate = (dateString?: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'TZS',
        minimumFractionDigits: 0,
    }).format(amount);

export default function LandlordTenantView({
    tenant,
    unit,
    tenancy,
    payments = [],
    utilities = [],
    properties = [],
}: LandlordTenantViewProps) {
    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <SidebarProvider defaultOpen={false}>
            <LandlordSidebar properties={properties} />
            <SidebarInset className="px-6 pt-4 pb-8">
                {/* Header */}
                <div className="mb-8 flex items-center gap-3">
                    <SidebarTrigger />
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">Tenant Details</h1>
                        <p className="text-sm text-muted-foreground">
                            Viewing information for {tenant.full_name}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('landlord.tenants.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Tenants
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Tenant Information */}
                <div className="mb-8 grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                                <p className="font-medium">{tenant.full_name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                <p className="font-medium">{tenant.phone}</p>
                            </div>
                            {tenant.email && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                                    <p className="font-medium">{tenant.email}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Unit Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {unit ? (
                                <>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Unit</p>
                                        <p className="font-medium">{unit.unit_name}</p>
                                        <p className="text-sm text-muted-foreground">{unit.unit_code}</p>
                                    </div>
                                    {tenancy && (
                                        <>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Move-in Date</p>
                                                <p className="font-medium">{formatDate(tenancy.move_in_date)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Status</p>
                                                <Badge
                                                    variant={tenancy.status === 'active' ? 'default' : 'secondary'}
                                                >
                                                    {tenancy.status}
                                                </Badge>
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <p className="text-muted-foreground">No active unit assigned</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Payments */}
                {payments.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Payments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>
                                                {formatDate(payment.paid_at || payment.created_at)}
                                            </TableCell>
                                            <TableCell>{formatCurrency(payment.amount)}</TableCell>
                                            <TableCell>{payment.method || '—'}</TableCell>
                                            <TableCell>
                                                <Badge variant="default">Paid</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Utilities */}
                {utilities.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Utilities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Utility</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {utilities.map((utility) => (
                                        <TableRow key={utility.id}>
                                            <TableCell>{utility.name}</TableCell>
                                            <TableCell>{formatCurrency(utility.amount)}</TableCell>
                                            <TableCell>{formatDate(utility.due_date)}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        utility.status === 'paid'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {utility.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Empty State */}
                {payments.length === 0 && utilities.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Home className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <p className="text-muted-foreground">
                                No payment or utility records found for this tenant.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </SidebarInset>
        </SidebarProvider>
    );
}
