import { LastPaymentsTable, Payment } from '@/components/shared/tenant/last-payments-table';
import { TenantSidebar } from '@/components/layout/tenant-sidebar';
import { UtilitiesTable, Utility } from '@/components/shared/tenant/utilities-table';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { router, Link } from '@inertiajs/react';
import {
    Bell,
    House,
    Zap,
    CalendarDays,
    MessageCircleMore,
    CheckCircle2,
    Clock,
} from 'lucide-react';
import { route } from 'ziggy-js';

interface Tenant {
    id: number;
    full_name: string;
    phone?: string;
    email?: string;
}

interface Unit {
    id: number;
    unit_name: string;
    unit_code: string;
    status: string;
}

interface Tenancy {
    move_in_date: string;
    status: string;
}

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    read_at: string | null;
    created_at: string;
}

interface TenantDashboardProps {
    tenant: Tenant;
    payments?: Payment[];
    unit?: Unit | null;
    tenancy?: Tenancy | null;
    utilities?: Utility[];
    notifications?: Notification[];
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

export default function TenantDashboard({
    payments = [],
    tenant = { id: 0, full_name: '' },
    unit = null,
    tenancy = null,
    utilities = [],
    notifications = [],
}: TenantDashboardProps) {
    const handleLogout = () => {
        router.post('/logout');
    };

    const totalUtilityBalance = utilities.reduce((sum, u) => {
        if (u.status.toLowerCase() !== 'paid') return sum + u.amount;
        return sum;
    }, 0);

    const pendingUtilities = utilities.filter(
        (u) => u.status.toLowerCase() !== 'paid',
    ).length;

    const unreadNotifications = notifications.filter((n) => !n.read_at).length;

    return (
        <SidebarProvider defaultOpen={false}>
            <TenantSidebar />
            <SidebarInset className="px-6 pt-4 pb-8">
                {/* Header */}
                <div className="mb-8 flex items-center gap-3">
                    <SidebarTrigger />
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">
                            Hello, {tenant.full_name}!
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {tenancy
                                ? "Here's an overview of your tenancy."
                                : 'No active tenancy found.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="#">
                                <MessageCircleMore className="h-5 w-5" />
                            </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="relative" asChild>
                            <Link href="#">
                                <Bell className="h-5 w-5" />
                                {unreadNotifications > 0 && (
                                    <span className="bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold">
                                        {unreadNotifications}
                                    </span>
                                )}
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Your Unit
                            </CardTitle>
                            <House className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {unit?.unit_name ?? '—'}
                            </div>
                            <p className="text-muted-foreground text-xs">
                                {unit?.unit_code ?? 'No unit assigned'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Tenancy Status
                            </CardTitle>
                            {tenancy?.status === 'active' ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                                <Clock className="text-muted-foreground h-4 w-4" />
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant={
                                        tenancy?.status === 'active'
                                            ? 'default'
                                            : 'secondary'
                                    }
                                    className="text-sm"
                                >
                                    {tenancy?.status ?? 'Inactive'}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Since {formatDate(tenancy?.move_in_date)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Utility Balance
                            </CardTitle>
                            <Zap className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(totalUtilityBalance)}
                            </div>
                            <p className="text-muted-foreground text-xs">
                                {pendingUtilities > 0
                                    ? `${pendingUtilities} unpaid bill${pendingUtilities > 1 ? 's' : ''}`
                                    : 'All bills settled'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Move-in Date
                            </CardTitle>
                            <CalendarDays className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {tenancy?.move_in_date
                                    ? new Date(tenancy.move_in_date).getFullYear()
                                    : '—'}
                            </div>
                            <p className="text-muted-foreground text-xs">
                                {formatDate(tenancy?.move_in_date)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    {/* Payments — wider column */}
                    <div className="lg:col-span-3">
                        <LastPaymentsTable payments={payments} />
                    </div>

                    {/* Utilities — narrower column */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-base font-semibold">
                                    Utilities
                                </CardTitle>
                                <Link
                                    href={route('tenant.utilities')}
                                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                                >
                                    See all
                                </Link>
                            </CardHeader>
                            <CardContent className="p-0">
                                <UtilitiesTable utilities={utilities} />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Notifications */}
                {notifications.length > 0 && (
                    <div className="mt-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-semibold">
                                    Notifications
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={`flex items-start gap-3 rounded-lg p-3 text-sm ${
                                                !n.read_at
                                                    ? 'bg-muted'
                                                    : ''
                                            }`}
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium">
                                                    {n.title}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    {n.message}
                                                </p>
                                            </div>
                                            <span className="text-muted-foreground shrink-0 text-xs">
                                                {formatDate(n.created_at)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </SidebarInset>
        </SidebarProvider>
    );
}
