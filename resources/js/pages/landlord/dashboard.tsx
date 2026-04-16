import { Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Building2,
    CalendarDays,
    ChevronRight,
    Clock,
    CreditCard,
    DollarSign,
    Home,
    Plus,
    Receipt,
    Users,
    Zap,
} from 'lucide-react';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
import { MetricCard, QuickAction } from '@/components/shared/DashboardComponents';
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
import { type SharedData } from '@/types';

/* ─── Interfaces ─────────────────────────────────────────────────── */

interface Property {
    id: number;
    name: string;
    address: string;
    units_count: number;
    active_tenants_count: number;
}

interface Stats {
    total_tenants: number;
    total_properties: number;
    total_units: number;
    monthly_revenue: number;
    pending_rent_bills: number;
    overdue_rent_bills: number;
    total_rent_outstanding: number;
}

interface LandlordDashboardProps {
    properties: {
        data: Property[];
    };
    stats: Stats;
    unreadNotificationsCount?: number;
}

/* ─── Formatting Helpers ─────────────────────────────────────────── */

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'TZS',
        minimumFractionDigits: 0,
    }).format(amount);

const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

/* ─── Main Component ─────────────────────────────────────────────── */

export default function Dashboard({
    properties,
    stats,
    unreadNotificationsCount = 0,
}: LandlordDashboardProps) {
    const propertiesList = properties.data || [];
    const { auth } = usePage<SharedData>().props;
    const firstName = auth?.user?.name?.split(' ')[0] ?? 'User';

    const handleLogout = () => router.post('/logout');
    const handleAddTenant = () => router.visit('/landlord/tenants/create');

    const occupancyRate =
        stats.total_units > 0
            ? Math.round((stats.total_tenants / stats.total_units) * 100)
            : 0;

    return (
        <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
                    
                    {/* Header Section */}
                    <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
                                    <CalendarDays className="w-3 h-3" />
                                    {getFormattedDate()}
                                </Badge>
                            </div>
                            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                                Welcome back, {firstName}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Here is what's happening across your portfolio today.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <Button asChild variant="outline" className="bg-card border-border/50 shadow-sm hover:bg-accent hidden sm:flex">
                                <Link href={route('landlord.tenants.index')}>
                                    <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                                    Tenants
                                </Link>
                            </Button>
                            <Button onClick={handleAddTenant} className="shadow-sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Tenant
                            </Button>
                        </div>
                    </header>

                    {/* KPI Summary Row */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard
                            title="Total Tenants"
                            value={stats.total_tenants}
                            icon={Users}
                            description={`Across ${stats.total_properties} properties`}
                        />
                        <MetricCard
                            title="Properties & Units"
                            value={stats.total_properties}
                            icon={Building2}
                            description={`${stats.total_units} total listed units`}
                        />
                        <MetricCard
                            title="Monthly Revenue"
                            value={formatCurrency(stats.monthly_revenue)}
                            icon={DollarSign}
                            description="Estimated this cycle"
                        />
                        <MetricCard
                            title="Occupancy Rate"
                            value={`${occupancyRate}%`}
                            icon={Home}
                            description={`${stats.total_tenants} of ${stats.total_units} units filled`}
                        />
                    </section>

                    {/* Main Split Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        
                        {/* LEFT PANEL: Properties List */}
                        <section className="lg:col-span-2 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold tracking-tight">Property Portfolio</h2>
                                <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                    <Link href={route('landlord.properties.index')}>
                                        View all
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </Button>
                            </div>

                            <Card className="bg-card shadow-sm border-border/50">
                                {propertiesList.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                            <Home className="h-5 w-5 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-foreground mb-1">No properties yet</h3>
                                        <p className="text-sm text-muted-foreground mb-6 max-w-[250px]">
                                            You haven't added any properties to your portfolio. Let's get started.
                                        </p>
                                        <Button asChild>
                                            <Link href={route('landlord.properties.index')}>Add Property</Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col">
                                        {propertiesList.map((property, idx) => (
                                            <div key={property.id} className="group">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 gap-4 hover:bg-muted/30 transition-colors">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10 shrink-0 mt-0.5">
                                                            <Building2 className="w-5 h-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <Link 
                                                                href={route('landlord.properties.units', property.id)} 
                                                                className="font-medium text-foreground hover:text-primary transition-colors text-base"
                                                            >
                                                                {property.name}
                                                            </Link>
                                                            <p className="text-sm text-muted-foreground">
                                                                {property.address || 'No address provided'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-6 sm:gap-8 ml-14 sm:ml-0">
                                                        {/* Visual Occupancy Pill */}
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="flex items-center justify-between text-xs">
                                                                <span className="text-muted-foreground">Occupancy</span>
                                                                <span className="font-medium text-foreground">
                                                                    {property.active_tenants_count} / {property.units_count}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        <Button asChild variant="ghost" size="icon" className="shrink-0 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity hidden sm:flex">
                                                            <Link href={route('landlord.properties.units', property.id)}>
                                                                <ChevronRight className="w-4 h-4" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                                {idx < propertiesList.length - 1 && <Separator className="bg-border/50" />}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        </section>

                        {/* RIGHT PANEL: Financial Health */}
                        <section className="flex flex-col gap-4">
                            <h2 className="text-lg font-semibold tracking-tight">Financial Health</h2>
                            
                            <Card className="bg-card shadow-sm border-border/50">
                                <CardHeader className="pb-3 px-5 pt-5">
                                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <Receipt className="w-4 h-4 text-primary/70" />
                                        Billing Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-5 pb-5 flex flex-col gap-3">
                                    
                                    {/* Actionable Bill Blocks */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <Link 
                                            href={route('landlord.rent-bills.index')} 
                                            className="flex flex-col p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/50 transition-colors"
                                        >
                                            <span className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                                Pending
                                            </span>
                                            <span className="text-2xl font-semibold">{stats.pending_rent_bills}</span>
                                        </Link>
                                        
                                        <Link 
                                            href={route('landlord.rent-bills.index')} 
                                            className={`flex flex-col p-4 rounded-xl border transition-colors ${stats.overdue_rent_bills > 0 ? 'bg-red-50 hover:bg-red-100 border-red-200 dark:bg-red-950/20 dark:border-red-900/30' : 'bg-card hover:bg-muted/50 border-border/60'}`}
                                        >
                                            <span className={`text-xs font-semibold mb-2 flex items-center gap-1.5 ${stats.overdue_rent_bills > 0 ? 'text-red-700 dark:text-red-400' : 'text-muted-foreground'}`}>
                                                {stats.overdue_rent_bills > 0 ? <AlertCircle className="w-3.5 h-3.5 shadow-sm rounded-full" /> : <Clock className="w-3.5 h-3.5" />}
                                                Overdue
                                            </span>
                                            <span className={`text-2xl font-semibold ${stats.overdue_rent_bills > 0 ? 'text-red-700 dark:text-red-400' : 'text-foreground'}`}>
                                                {stats.overdue_rent_bills}
                                            </span>
                                        </Link>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-border/50 flex flex-col gap-1">
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Outstanding Balance</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold tracking-tight text-foreground">{formatCurrency(stats.total_rent_outstanding)}</span>
                                        </div>
                                    </div>

                                </CardContent>
                            </Card>

                            {stats.overdue_rent_bills > 0 && (
                                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-3 rounded-xl flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <p>You have overdue rent bills. Please review them in the billing section.</p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Quick Access Row */}
                    <section className="flex flex-col gap-4 mt-4">
                        <h2 className="text-lg font-semibold tracking-tight">Quick Access</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            <QuickAction label="New Tenant" icon={Plus} href={route('landlord.tenants.create')} />
                            <QuickAction label="Add Unit" icon={Building2} href={route('landlord.units.create')} />
                            <QuickAction label="Payments" icon={CreditCard} href={route('landlord.payments.index')} />
                            <QuickAction label="Rent Bills" icon={Receipt} href={route('landlord.rent-bills.index')} />
                            <QuickAction label="Utilities" icon={Zap} href={route('landlord.utilities.index')} />
                            <QuickAction label="All Tenants" icon={Users} href={route('landlord.tenants.index')} />
                        </div>
                    </section>

                    {/* Footer / Logout */}
                    <div className="mt-auto pt-8 flex justify-center">
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                            Sign out of dashboard
                        </Button>
                    </div>

        </main>
    );
}

Dashboard.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
