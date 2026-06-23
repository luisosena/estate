import { Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    ArrowUpRight,
    Bell,
    Building2,
    CalendarDays,
    ChevronDown,
    ChevronRight,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    FileSpreadsheet,
    FileText,
    Home,
    LayoutGrid,
    MapPin,
    Plus,
    Receipt,
    Sparkles,
    Upload,
    Users,
    Zap,
    type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
import { PaymentCollectionChart } from '@/components/shared/payment-collection-chart';
import { RevenueTrendChart } from '@/components/shared/revenue-trend-chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';

interface Property {
    id: number;
    name: string;
    address: string;
    units_count: number;
    active_tenants_count: number;
    property_type?: string | null;
    city?: string | null;
    updated_at?: string | null;
}

interface Stats {
    total_tenants: number;
    occupied_units: number;
    total_properties: number;
    total_units: number;
    occupancy_rate: number;
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
    revenueTrend?: {
        month: string;
        label: string;
        total_revenue: number;
        payment_count: number;
    }[];
    collectionTrend?: {
        month: string;
        label: string;
        paid: number;
        pending: number;
        overdue: number;
        partial: number;
        waived: number;
        total: number;
    }[];
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'TZS',
        minimumFractionDigits: 0,
    }).format(amount);

const formatCurrencyCompact = (amount: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'TZS',
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(amount);

const formatNumber = (value: number) =>
    new Intl.NumberFormat('en-US').format(value);

const getFormattedDate = () =>
    new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

const PROPERTY_TYPE_LABELS: Record<string, string> = {
    apartment: 'Apartment',
    house: 'House',
    commercial: 'Commercial',
    townhouse: 'Townhouse',
    studio: 'Studio',
    villa: 'Villa',
    office: 'Office',
    retail: 'Retail',
    warehouse: 'Warehouse',
    land: 'Land',
};

const formatPropertyType = (type?: string | null) => {
    if (!type) return null;
    const known = PROPERTY_TYPE_LABELS[type.toLowerCase()];
    if (known) return known;
    return type.charAt(0).toUpperCase() + type.slice(1);
};

type KpiColor = 'purple' | 'peach' | 'green' | 'blue';

const KPI_COLORS: Record<KpiColor, string> = {
    purple: 'bg-[#E6D5FF]',
    peach: 'bg-[#FFE8D6]',
    green: 'bg-[#D4F2E0]',
    blue: 'bg-[#D4F0FF]',
};

function KpiCard({
    title,
    value,
    icon: Icon,
    description,
    color = 'purple',
    progress,
}: {
    title: string;
    value: string;
    icon: LucideIcon;
    description: string;
    color?: KpiColor;
    progress?: number;
}) {
    return (
        <div
            className={cn(
                'flex flex-col gap-3 rounded-2xl border border-black p-5',
                KPI_COLORS[color],
            )}
        >
            <Icon
                className="h-5 w-5 text-gray-900"
                strokeWidth={1.5}
                aria-hidden="true"
            />
            <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold tracking-tight text-gray-900 tabular-nums sm:text-3xl">
                    {value}
                </span>
                <div className="text-sm font-semibold text-gray-800">
                    {title}
                </div>
                <p className="text-xs font-normal text-gray-600">
                    {description}
                </p>
            </div>
            {typeof progress === 'number' && (
                <Progress
                    value={progress}
                    className="mt-1 h-1.5 bg-white/60 [&_[data-slot=progress-indicator]]:bg-gray-900"
                />
            )}
        </div>
    );
}

export default function Dashboard({
    properties,
    stats,
    revenueTrend = [],
    collectionTrend = [],
    unreadNotificationsCount = 0,
}: LandlordDashboardProps) {
    const propertiesList = properties.data || [];
    const { auth } = usePage<SharedData>().props;
    const firstName = auth?.user?.name?.split(' ')[0] ?? 'User';

    const [chartMonths, setChartMonths] = useState<number>(6);

    const handleChartRangeChange = (value: string) => {
        const months = parseInt(value, 10);
        if (Number.isNaN(months)) return;
        setChartMonths(months);
        router.reload({
            only: ['revenueTrend', 'collectionTrend'],
            data: { months },
        });
    };

    const occupancyRate = stats.occupancy_rate ?? (
        stats.total_units > 0
            ? Math.round((stats.occupied_units / stats.total_units) * 100)
            : 0
    );

    const hasOverdueBills = stats.overdue_rent_bills > 0;
    const hasPendingBills = stats.pending_rent_bills > 0;

    const exportMenu = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4 text-muted-foreground" />
                    Export
                    <ChevronDown className="ml-1.5 h-3.5 w-3.5 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                    <a
                        href={route('landlord.dashboard.export.csv')}
                        className="cursor-pointer"
                    >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Export as CSV
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <a
                        href={route('landlord.dashboard.export.pdf')}
                        className="cursor-pointer"
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Export as PDF
                    </a>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <div
            className="min-h-full font-sans"
            style={{ backgroundColor: '#fff7f0' }}
        >
            <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-4 py-6 pb-12 sm:px-6 lg:px-8">
                {/* Header Section */}
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <Badge variant="outline" className="gap-1.5 text-xs font-medium text-muted-foreground">
                                <CalendarDays className="h-3 w-3" />
                                {getFormattedDate()}
                            </Badge>
                        </div>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Welcome back, {firstName}
                        </h1>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <Button
                            asChild
                            variant="outline"
                            size="icon"
                            className="relative hidden sm:flex"
                            aria-label={
                                unreadNotificationsCount > 0
                                    ? `Notifications, ${unreadNotificationsCount} unread`
                                    : 'Notifications'
                            }
                        >
                            <Link href={route('landlord.notifications.index')}>
                                <Bell className="h-4 w-4" aria-hidden="true" />
                                {unreadNotificationsCount > 0 && (
                                    <span
                                        aria-hidden="true"
                                        className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground"
                                    >
                                        {unreadNotificationsCount > 99
                                            ? '99+'
                                            : unreadNotificationsCount}
                                    </span>
                                )}
                            </Link>
                        </Button>

                        <Button asChild variant="outline" className="hidden sm:flex">
                            <Link href={route('landlord.tenants.index')}>
                                <Users className="mr-2 h-4 w-4" aria-hidden="true" />
                                Tenants
                            </Link>
                        </Button>

                        <div className="hidden sm:block">{exportMenu}</div>

                        <Button onClick={() => router.visit('/landlord/tenants/create')}>
                            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                            Add Tenant
                        </Button>
                    </div>
                </header>

                {/* KPI Summary Row */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard
                        title="Total Tenants"
                        value={formatNumber(stats.total_tenants)}
                        icon={Users}
                        description={`Across ${formatNumber(stats.total_properties)} properties`}
                        color="purple"
                    />
                    <KpiCard
                        title="Properties & Units"
                        value={formatNumber(stats.total_properties)}
                        icon={Building2}
                        description={`${formatNumber(stats.total_units)} total listed units`}
                        color="peach"
                    />
                    <KpiCard
                        title="Monthly Revenue"
                        value={formatCurrencyCompact(stats.monthly_revenue)}
                        icon={DollarSign}
                        description="Collected this month"
                        color="green"
                    />
                    <KpiCard
                        title="Occupancy Rate"
                        value={`${occupancyRate}%`}
                        icon={Home}
                        description={`${formatNumber(stats.occupied_units)} of ${formatNumber(stats.total_units)} units filled`}
                        color="blue"
                        progress={occupancyRate}
                    />
                </section>

                {/* Main Split Grid */}
                <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
                    {/* LEFT PANEL: Properties List */}
                    <section className="flex flex-col gap-4 lg:col-span-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Building2
                                    className="h-4 w-4 text-muted-foreground"
                                    aria-hidden="true"
                                />
                                <h2 className="text-lg font-semibold tracking-tight">
                                    Property Portfolio
                                </h2>
                            </div>
                            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                <Link href={route('landlord.properties.index')}>
                                    View all
                                    <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                                </Link>
                            </Button>
                        </div>

                        {propertiesList.length === 0 ? (
                            <Card className="shadow-none">
                                <CardContent className="flex flex-col items-center justify-center px-4 py-16 text-center">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                        <Home className="h-5 w-5 text-primary" aria-hidden="true" />
                                    </div>
                                    <h3 className="mb-1 text-lg font-semibold">No properties yet</h3>
                                    <p className="mb-6 max-w-[250px] text-sm text-muted-foreground">
                                        You haven't added any properties to your portfolio. Let's get
                                        started.
                                    </p>
                                    <Button asChild>
                                        <Link href={route('landlord.properties.index')}>
                                            Add Property
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="overflow-hidden rounded-2xl bg-[#FFE8D6] p-0 shadow-none">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="h-10 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Property</TableHead>
                                            <TableHead className="hidden h-10 text-xs font-semibold tracking-wider text-muted-foreground uppercase sm:table-cell">Type</TableHead>
                                            <TableHead className="h-10 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase">Occupancy</TableHead>
                                            <TableHead className="h-10 w-12 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {propertiesList.map((property) => {
                                            const occupied = property.active_tenants_count;
                                            const total = property.units_count;
                                            const vacant = Math.max(total - occupied, 0);
                                            const rate =
                                                total > 0 ? Math.round((occupied / total) * 100) : 0;
                                            const typeLabel = formatPropertyType(property.property_type);

                                            return (
                                                <TableRow key={property.id} className="group hover:bg-white/40">
                                                    <TableCell className="py-3 align-middle">
                                                        <HoverCard openDelay={200} closeDelay={100}>
                                                            <HoverCardTrigger asChild>
                                                                <Link
                                                                    href={route(
                                                                        'landlord.properties.units',
                                                                        property.id,
                                                                    )}
                                                                    className="flex items-start gap-3"
                                                                >
                                                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                                                        <Building2
                                                                            className="h-4 w-4"
                                                                            aria-hidden="true"
                                                                        />
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="truncate text-sm font-medium hover:text-primary">
                                                                            {property.name}
                                                                        </div>
                                                                        <div className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                                                                            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                                                                            <span className="truncate">
                                                                                {property.address || 'No address provided'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            </HoverCardTrigger>
                                                            <HoverCardContent className="w-80" side="right">
                                                                <div className="flex flex-col gap-2">
                                                                    <div className="text-sm font-semibold">{property.name}</div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {property.address || 'No address provided'}
                                                                        {property.city ? `, ${property.city}` : ''}
                                                                    </div>
                                                                    <Separator className="my-1" />
                                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                                        <div>
                                                                            <div className="text-muted-foreground">Units</div>
                                                                            <div className="font-semibold tabular-nums">{formatNumber(total)}</div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-muted-foreground">Tenants</div>
                                                                            <div className="font-semibold tabular-nums">{formatNumber(occupied)}</div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-muted-foreground">Vacant</div>
                                                                            <div className="font-semibold tabular-nums">{formatNumber(vacant)}</div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-muted-foreground">Occupancy</div>
                                                                            <div className="font-semibold tabular-nums">{rate}%</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </HoverCardContent>
                                                        </HoverCard>
                                                    </TableCell>
                                                    <TableCell className="hidden align-middle sm:table-cell">
                                                        {typeLabel ? (
                                                            <Badge variant="secondary" className="font-normal">
                                                                {typeLabel}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="align-middle">
                                                        <div className="flex flex-col items-end gap-1.5">
                                                            <span className="text-sm font-semibold tabular-nums">
                                                                {rate}%
                                                            </span>
                                                            <Progress
                                                                value={rate}
                                                                className={cn(
                                                                    'h-1.5 w-24',
                                                                    rate < 50 && '[&_[data-slot=progress-indicator]]:bg-rose-500',
                                                                    rate >= 50 && rate < 80 && '[&_[data-slot=progress-indicator]]:bg-amber-500',
                                                                )}
                                                            />
                                                            <span className="text-[10px] text-muted-foreground tabular-nums">
                                                                {formatNumber(occupied)}/{formatNumber(total)} {vacant > 0 && `· ${formatNumber(vacant)} vacant`}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="align-middle">
                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-muted-foreground opacity-50 transition-opacity group-hover:opacity-100"
                                                            aria-label={`View units for ${property.name}`}
                                                        >
                                                            <Link
                                                                href={route(
                                                                    'landlord.properties.units',
                                                                    property.id,
                                                                )}
                                                            >
                                                                <ChevronRight
                                                                    className="h-4 w-4"
                                                                    aria-hidden="true"
                                                                />
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </Card>
                        )}
                    </section>

                    {/* RIGHT PANEL: Financial Health */}
                    <section className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Receipt
                                className="h-4 w-4 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <h2 className="text-lg font-semibold tracking-tight">
                                Financial Health
                            </h2>
                        </div>

                        <Card className="gap-3 py-5 shadow-none">
                            <CardHeader className="px-5 pt-0 pb-2">
                                <CardTitle className="flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                                    <Receipt
                                        className="h-3.5 w-3.5 text-primary/70"
                                        aria-hidden="true"
                                    />
                                    Billing Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3 px-5 pb-0">
                                <div className="grid grid-cols-2 gap-3">
                                    <Link
                                        href={route('landlord.rent-bills.index')}
                                        className="group flex flex-col rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                                    >
                                        <span className="mb-2 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                <Clock
                                                    className="h-3.5 w-3.5 text-amber-500"
                                                    aria-hidden="true"
                                                />
                                                Pending
                                            </span>
                                            <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-60" />
                                        </span>
                                        <span className="text-2xl font-semibold tabular-nums">
                                            {formatNumber(stats.pending_rent_bills)}
                                        </span>
                                    </Link>

                                    <Link
                                        href={route('landlord.rent-bills.index')}
                                        className={cn(
                                            'group flex flex-col rounded-lg border p-4 transition-colors',
                                            hasOverdueBills
                                                ? 'border-destructive/30 bg-destructive/5 hover:bg-destructive/10'
                                                : 'bg-card hover:bg-muted/50',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'mb-2 flex items-center justify-between text-xs font-semibold',
                                                hasOverdueBills
                                                    ? 'text-destructive'
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            <span className="flex items-center gap-1.5">
                                                {hasOverdueBills ? (
                                                    <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                                                ) : (
                                                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                                                )}
                                                Overdue
                                            </span>
                                            <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-60" />
                                        </span>
                                        <span
                                            className={cn(
                                                'text-2xl font-semibold tabular-nums',
                                                hasOverdueBills && 'text-destructive',
                                            )}
                                        >
                                            {formatNumber(stats.overdue_rent_bills)}
                                        </span>
                                    </Link>
                                </div>

                                <Separator className="my-2" />

                                <div className="flex flex-col gap-1 pb-2">
                                    <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Total Outstanding Balance
                                    </span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-semibold tracking-tight tabular-nums">
                                            {formatCurrency(stats.total_rent_outstanding)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </div>

                {/* Charts Section */}
                <section className="flex flex-col gap-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2">
                            <LayoutGrid
                                className="h-4 w-4 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <h2 className="text-lg font-semibold tracking-tight">
                                Performance Overview
                            </h2>
                        </div>
                        <Tabs
                            value={String(chartMonths)}
                            onValueChange={handleChartRangeChange}
                        >
                            <TabsList aria-label="Chart time range">
                                <TabsTrigger value="3">3M</TabsTrigger>
                                <TabsTrigger value="6">6M</TabsTrigger>
                                <TabsTrigger value="12">12M</TabsTrigger>
                                <TabsTrigger value="24">24M</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <RevenueTrendChart data={revenueTrend} />
                        <PaymentCollectionChart data={collectionTrend} />
                    </div>
                </section>

                {/* Quick Access Row */}
                <section className="mt-4 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Sparkles
                            className="h-4 w-4 text-muted-foreground"
                            aria-hidden="true"
                        />
                        <h2 className="text-lg font-semibold tracking-tight">Quick Access</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {[
                            { label: 'New Tenant', icon: Plus, href: route('landlord.tenants.create') },
                            { label: 'Add Unit', icon: Building2, href: route('landlord.units.create') },
                            { label: 'Payments', icon: CreditCard, href: route('landlord.payments.index') },
                            { label: 'Rent Bills', icon: Receipt, href: route('landlord.rent-bills.index') },
                            { label: 'Utilities', icon: Zap, href: route('landlord.utilities.index') },
                            { label: 'All Tenants', icon: Users, href: route('landlord.tenants.index') },
                            { label: 'Bulk Import', icon: Upload, href: route('landlord.import.index') },
                        ].map((action) => (
                            <Button
                                key={action.label}
                                asChild
                                variant="outline"
                                className="h-auto justify-start gap-3 px-4 py-3 shadow-none"
                            >
                                <Link href={action.href}>
                                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                                        <action.icon className="h-3.5 w-3.5" aria-hidden="true" />
                                    </span>
                                    <span className="text-sm font-medium">{action.label}</span>
                                </Link>
                            </Button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 sm:hidden">
                        <div className="flex-1">{exportMenu}</div>
                    </div>
                </section>
            </main>
        </div>
    );
}

Dashboard.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
