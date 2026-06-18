import { Link, router, usePage } from '@inertiajs/react';
import {
  AlertCircle,
  ArrowRight,
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
  Plus,
  Receipt,
  Sparkles,
  Upload,
  Users,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
import {
  MetricCard,
  QuickAction,
} from '@/components/shared/DashboardComponents';
import { PaymentCollectionChart } from '@/components/shared/payment-collection-chart';
import { RevenueTrendChart } from '@/components/shared/revenue-trend-chart';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';

/* ─── Interfaces ─────────────────────────────────────────────────── */

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

/* ─── Formatting Helpers ─────────────────────────────────────────── */

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

const getOccupancyTone = (rate: number) => {
  if (rate >= 80)
    return {
      bar: 'bg-emerald-500',
      text: 'text-emerald-700 dark:text-emerald-400',
    };
  if (rate >= 50)
    return { bar: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400' };
  return { bar: 'bg-red-500', text: 'text-red-700 dark:text-red-400' };
};

/* ─── Main Component ─────────────────────────────────────────────── */

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

  const occupancyRate =
    stats.total_units > 0
      ? Math.round((stats.occupied_units / stats.total_units) * 100)
      : 0;

  const hasOverdueBills = stats.overdue_rent_bills > 0;
  const hasPendingBills = stats.pending_rent_bills > 0;

  const contextMessage = hasOverdueBills
    ? `${stats.overdue_rent_bills} overdue bill${stats.overdue_rent_bills > 1 ? 's' : ''} · ${formatCurrencyCompact(stats.total_rent_outstanding)} outstanding`
    : hasPendingBills
      ? `${stats.pending_rent_bills} pending bill${stats.pending_rent_bills > 1 ? 's' : ''} awaiting payment`
      : 'All bills are up to date across your portfolio.';

  const exportMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-border/50 bg-card shadow-sm hover:bg-accent"
        >
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
    <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-4 py-6 pb-12 sm:px-6 lg:px-8">
      {/* Header Section */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge
              variant="outline"
              className="flex items-center gap-1.5 border-border/50 bg-card text-xs font-medium text-muted-foreground"
            >
              <CalendarDays className="h-3 w-3" />
              {getFormattedDate()}
            </Badge>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Welcome back, {firstName}
          </h1>
          <p
            className={cn(
              'mt-1.5 flex items-center gap-1.5 text-sm',
              hasOverdueBills
                ? 'font-medium text-red-600 dark:text-red-400'
                : 'text-muted-foreground',
            )}
          >
            {hasOverdueBills && (
              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{contextMessage}</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Notification Bell */}
          <Button
            asChild
            variant="outline"
            size="icon"
            className="relative hidden border-border/50 bg-card shadow-sm hover:bg-accent sm:flex"
            aria-label={
              unreadNotificationsCount > 0
                ? `Notifications, ${unreadNotificationsCount} unread`
                : 'Notifications'
            }
          >
            <Link href={route('landlord.notifications.index')}>
              <Bell
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
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

          <Button
            asChild
            variant="outline"
            className="hidden border-border/50 bg-card shadow-sm hover:bg-accent sm:flex"
          >
            <Link href={route('landlord.tenants.index')}>
              <Users
                className="mr-2 h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              Tenants
            </Link>
          </Button>

          <div className="hidden sm:block">{exportMenu}</div>

          <Button
            onClick={() => router.visit('/landlord/tenants/create')}
            className="shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Add Tenant
          </Button>
        </div>
      </header>

      {/* KPI Summary Row */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Tenants"
          value={stats.total_tenants}
          icon={Users}
          description={`Across ${stats.total_properties} properties`}
          accent="violet"
        />
        <MetricCard
          title="Properties & Units"
          value={stats.total_properties}
          icon={Building2}
          description={`${stats.total_units} total listed units`}
          accent="amber"
        />
        <MetricCard
          title="Monthly Revenue"
          value={formatCurrencyCompact(stats.monthly_revenue)}
          icon={DollarSign}
          description="Estimated this cycle"
          accent="emerald"
        />
        <MetricCard
          title="Occupancy Rate"
          value={`${occupancyRate}%`}
          icon={Home}
          description={`${stats.occupied_units} of ${stats.total_units} units filled`}
          accent="blue"
        />
      </section>

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

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
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
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Link href={route('landlord.properties.index')}>
                View all
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <Card className="border-border/50 bg-card shadow-sm">
            {propertiesList.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Home className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="mb-1 text-lg font-semibold text-foreground">
                  No properties yet
                </h3>
                <p className="mb-6 max-w-[250px] text-sm text-muted-foreground">
                  You haven't added any properties to your portfolio. Let's get
                  started.
                </p>
                <Button asChild>
                  <Link href={route('landlord.properties.index')}>
                    Add Property
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col">
                {propertiesList.map((property, idx) => {
                  const occupied = property.active_tenants_count;
                  const total = property.units_count;
                  const vacant = Math.max(total - occupied, 0);
                  const rate =
                    total > 0 ? Math.round((occupied / total) * 100) : 0;
                  const tone = getOccupancyTone(rate);
                  const typeLabel = formatPropertyType(property.property_type);
                  return (
                    <div key={property.id} className="group">
                      <div className="flex flex-col justify-between gap-4 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:px-6">
                        <div className="flex min-w-0 flex-1 items-start gap-4">
                          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/10 bg-primary/5">
                            <Building2
                              className="h-5 w-5 text-primary"
                              aria-hidden="true"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                href={route(
                                  'landlord.properties.units',
                                  property.id,
                                )}
                                className="text-base font-medium text-foreground transition-colors hover:text-primary"
                              >
                                {property.name}
                              </Link>
                              {typeLabel && (
                                <Badge
                                  variant="secondary"
                                  className="h-4 border border-border/40 bg-muted/60 px-1.5 py-0 text-[10px] font-medium text-muted-foreground"
                                >
                                  {typeLabel}
                                </Badge>
                              )}
                            </div>
                            <p className="truncate text-sm text-muted-foreground">
                              {property.address || 'No address provided'}
                            </p>
                          </div>
                        </div>

                        <div className="ml-14 flex shrink-0 items-center gap-6 sm:ml-0 sm:gap-8">
                          {/* Occupancy with progress bar */}
                          <div className="flex min-w-[160px] flex-col gap-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                Occupancy
                              </span>
                              <span
                                className={cn(
                                  'font-semibold tabular-nums',
                                  tone.text,
                                )}
                              >
                                {rate}%
                              </span>
                            </div>
                            <div
                              className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                              role="progressbar"
                              aria-valuenow={rate}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`Occupancy ${rate}%`}
                            >
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all',
                                  tone.bar,
                                )}
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                              <span className="tabular-nums">
                                {occupied} / {total} filled
                              </span>
                              {vacant > 0 && (
                                <span className="text-amber-600 tabular-nums dark:text-amber-400">
                                  {vacant} vacant
                                </span>
                              )}
                            </div>
                          </div>

                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="hidden shrink-0 text-muted-foreground opacity-50 transition-opacity group-hover:opacity-100 sm:flex"
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
                        </div>
                      </div>
                      {idx < propertiesList.length - 1 && (
                        <Separator className="bg-border/50" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
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

          <Card className="border-border/50 bg-card shadow-sm">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium tracking-widest text-muted-foreground uppercase">
                <Receipt
                  className="h-4 w-4 text-primary/70"
                  aria-hidden="true"
                />
                Billing Status
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 px-5 pb-5">
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href={route('landlord.rent-bills.index')}
                  className="flex flex-col rounded-xl border border-border/60 bg-card p-4 transition-colors hover:bg-muted/50"
                >
                  <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <Clock
                      className="h-3.5 w-3.5 text-amber-500"
                      aria-hidden="true"
                    />
                    Pending
                  </span>
                  <span className="text-2xl font-semibold tabular-nums">
                    {stats.pending_rent_bills}
                  </span>
                </Link>

                <Link
                  href={route('landlord.rent-bills.index')}
                  className={cn(
                    'flex flex-col rounded-xl border p-4 transition-colors',
                    hasOverdueBills
                      ? 'border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-900/30 dark:bg-red-950/20'
                      : 'border-border/60 bg-card hover:bg-muted/50',
                  )}
                >
                  <span
                    className={cn(
                      'mb-2 flex items-center gap-1.5 text-xs font-semibold',
                      hasOverdueBills
                        ? 'text-red-700 dark:text-red-400'
                        : 'text-muted-foreground',
                    )}
                  >
                    {hasOverdueBills ? (
                      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    Overdue
                  </span>
                  <span
                    className={cn(
                      'text-2xl font-semibold tabular-nums',
                      hasOverdueBills
                        ? 'text-red-700 dark:text-red-400'
                        : 'text-foreground',
                    )}
                  >
                    {stats.overdue_rent_bills}
                  </span>
                </Link>
              </div>

              <div className="mt-4 flex flex-col gap-1 border-t border-border/50 pt-4">
                <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  Total Outstanding Balance
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
                    {formatCurrency(stats.total_rent_outstanding)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {hasOverdueBills && (
            <Alert
              role="status"
              aria-live="polite"
              variant="destructive"
              className="border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200 [&>svg]:text-red-600 dark:[&>svg]:text-red-400"
            >
              <AlertCircle />
              <AlertTitle className="text-red-900 dark:text-red-200">
                Overdue bills require attention
              </AlertTitle>
              <AlertDescription className="text-red-800/90 dark:text-red-300/90">
                <p className="mb-3">
                  You have {stats.overdue_rent_bills} overdue rent bill
                  {stats.overdue_rent_bills > 1 ? 's' : ''} totaling{' '}
                  {formatCurrencyCompact(stats.total_rent_outstanding)}.
                </p>
                <Button
                  asChild
                  size="sm"
                  variant="destructive"
                  className="h-8 bg-red-600 text-white shadow-sm hover:bg-red-700"
                >
                  <Link href={route('landlord.rent-bills.index')}>
                    Review overdue bills
                    <ArrowRight
                      className="ml-1.5 h-3.5 w-3.5"
                      aria-hidden="true"
                    />
                  </Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </section>
      </div>

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
          <QuickAction
            label="New Tenant"
            icon={Plus}
            href={route('landlord.tenants.create')}
          />
          <QuickAction
            label="Add Unit"
            icon={Building2}
            href={route('landlord.units.create')}
          />
          <QuickAction
            label="Payments"
            icon={CreditCard}
            href={route('landlord.payments.index')}
          />
          <QuickAction
            label="Rent Bills"
            icon={Receipt}
            href={route('landlord.rent-bills.index')}
          />
          <QuickAction
            label="Utilities"
            icon={Zap}
            href={route('landlord.utilities.index')}
          />
          <QuickAction
            label="All Tenants"
            icon={Users}
            href={route('landlord.tenants.index')}
          />
          <QuickAction
            label="Bulk Import"
            icon={Upload}
            href={route('landlord.import.index')}
          />
        </div>
        <div className="flex items-center gap-2 sm:hidden">
          <div className="flex-1">{exportMenu}</div>
        </div>
      </section>
    </main>
  );
}

Dashboard.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
