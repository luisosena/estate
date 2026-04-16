import { Link, router, usePage } from '@inertiajs/react';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  House,
  MessageCircleMore,
  Zap,
  Receipt,
  AlertCircle,
  CreditCard,
  Users,
  Building2,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import React, { useMemo } from 'react';
import { route } from 'ziggy-js';

import TenantLayout from '@/components/layout/TenantLayout';
import { MetricCard, QuickAction } from '@/components/shared/DashboardComponents';
import {
  LastPaymentsTable,
  Payment,
} from '@/components/shared/tenant/last-payments-table';
import {
  UtilitiesTable,
  Utility,
} from '@/components/shared/tenant/utilities-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate, getFormattedDate } from '@/lib/formatters';
import { type SharedData } from '@/types';

/* ─── Interfaces ─────────────────────────────────────────────────── */

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
  id: string;
  type: string;
  data: any;
  read_at: string | null;
  created_at: string;
}

interface RentBill {
  id: number;
  billing_month: string;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  status: 'pending' | 'paid' | 'partial' | 'overdue' | 'waived';
  outstanding_amount: number;
}

interface TenantDashboardProps {
  tenant: Tenant;
  payments?: Payment[];
  unit?: Unit | null;
  tenancy?: Tenancy | null;
  utilities?: Utility[];
  notifications?: Notification[];
  rent_bills?: RentBill[];
  current_month_bill?: RentBill | null;
}


/* ─── Main Component ─────────────────────────────────────────────── */

export default function TenantDashboard({
  payments = [],
  tenant = { id: 0, full_name: '' },
  unit = null,
  tenancy = null,
  utilities = [],
  notifications = [],
  rent_bills = [],
  current_month_bill = null,
}: TenantDashboardProps) {
  const { auth } = usePage<SharedData>().props;
  const firstName = tenant.full_name.split(' ')[0] ?? 'User';

  const totalUtilityBalance = useMemo(() => 
    utilities.reduce((sum, u) => {
      if (u.status.toLowerCase() !== 'paid') return sum + u.amount;
      return sum;
    }, 0),
    [utilities]
  );

  const pendingUtilities = useMemo(() => 
    utilities.filter(
      (u) => u.status.toLowerCase() !== 'paid',
    ).length,
    [utilities]
  );

  const unreadNotificationsCount = useMemo(() => 
    notifications.filter((n) => !n.read_at).length,
    [notifications]
  );

  return (
    <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <SidebarTrigger className="-ml-2 md:hidden" />
                    <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
                        <CalendarDays className="w-3 h-3" />
                        {getFormattedDate()}
                    </Badge>
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Hello, {firstName}!
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {tenancy
                        ? "Here is what's happening with your tenancy today."
                        : 'No active tenancy found.'}
                </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <Button asChild variant="outline" className="bg-card border-border/50 shadow-sm hover:bg-accent hidden sm:flex">
                    <Link href={route('tenant.payments')}>
                        <CreditCard className="w-4 h-4 mr-2 text-muted-foreground" />
                        Payment History
                    </Link>
                </Button>
                <Button asChild className="shadow-sm">
                    <Link href={route('tenant.payments.make')}>
                        <Zap className="w-4 h-4 mr-2" />
                        Pay Now
                    </Link>
                </Button>
            </div>
        </header>

        {/* KPI Summary Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
                title="Your Unit"
                value={unit?.unit_name ?? '—'}
                icon={House}
                description={unit?.unit_code ?? 'No unit assigned'}
                trend={tenancy?.status === 'active' ? { label: 'Active', value: '' } : undefined}
            />
            <MetricCard
                title="Rent Balance"
                value={formatCurrency(current_month_bill?.outstanding_amount ?? 0)}
                icon={Receipt}
                description={current_month_bill ? `Due: ${formatDate(current_month_bill.due_date)}` : 'No bills found'}
                alert={current_month_bill?.status === 'overdue'}
            />
            <MetricCard
                title="Utility Balance"
                value={formatCurrency(totalUtilityBalance)}
                icon={Zap}
                description={`${pendingUtilities} unpaid bill${pendingUtilities !== 1 ? 's' : ''}`}
                alert={pendingUtilities > 0}
            />
            <MetricCard
                title="Notifications"
                value={unreadNotificationsCount}
                icon={MessageCircleMore}
                description="Unread alerts for you"
                trend={unreadNotificationsCount > 0 ? { label: 'Action Required', value: '' } : undefined}
            />
        </section>

        {/* Main Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* LEFT PANEL: Latest Payments */}
            <section className="lg:col-span-2 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold tracking-tight">Recent Activity</h2>
                    <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <Link href={route('tenant.payments')}>
                            View history
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </Button>
                </div>

                <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
                    <LastPaymentsTable payments={payments} />
                </div>

                {/* Second Row: Utilities */}
                <div className="mt-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold tracking-tight">Utilities Overview</h2>
                        <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                            <Link href={route('tenant.utilities')}>
                                See all
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </Button>
                    </div>
                    <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
                        <UtilitiesTable utilities={utilities} />
                    </div>
                </div>
            </section>

            {/* RIGHT PANEL: Financial Health & Quick Access */}
            <section className="flex flex-col gap-6">
                
                {/* Financial Health Section */}
                <div className="flex flex-col gap-4">
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
                            <div className="grid grid-cols-1 gap-3">
                                <Link 
                                    href={route('tenant.rent-bills.index')} 
                                    className={cn(
                                        "flex flex-col p-4 rounded-xl border transition-colors",
                                        current_month_bill?.status === 'overdue' 
                                            ? 'bg-red-50 hover:bg-red-100 border-red-200 dark:bg-red-950/20 dark:border-red-900/30' 
                                            : 'bg-card hover:bg-muted/50 border-border/60'
                                    )}
                                >
                                    <span className={cn(
                                        "text-xs font-semibold mb-2 flex items-center gap-1.5",
                                        current_month_bill?.status === 'overdue' ? 'text-red-700 dark:text-red-400' : 'text-muted-foreground'
                                    )}>
                                        {current_month_bill?.status === 'overdue' ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5 text-amber-500" />}
                                        Rent: {current_month_bill?.status ?? 'No Bill'}
                                    </span>
                                    <div className="flex justify-between items-end">
                                        <span className={cn(
                                            "text-2xl font-bold",
                                            current_month_bill?.status === 'overdue' ? 'text-red-700 dark:text-red-400' : 'text-foreground'
                                        )}>
                                            {formatCurrency(current_month_bill?.outstanding_amount ?? 0)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">Due {formatDate(current_month_bill?.due_date)}</span>
                                    </div>
                                </Link>
                                
                                <Link 
                                    href={route('tenant.utilities')} 
                                    className={cn(
                                        "flex flex-col p-4 rounded-xl border transition-colors",
                                        pendingUtilities > 0 
                                            ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30' 
                                            : 'bg-card hover:bg-muted/50 border-border/60'
                                    )}
                                >
                                    <span className={cn(
                                        "text-xs font-semibold mb-2 flex items-center gap-1.5",
                                        pendingUtilities > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground'
                                    )}>
                                        <Zap className={cn("w-3.5 h-3.5", pendingUtilities > 0 ? "text-amber-600" : "text-muted-foreground")} />
                                        Utilities: {pendingUtilities} Pending
                                    </span>
                                    <div className="flex justify-between items-end">
                                        <span className={cn(
                                            "text-2xl font-bold",
                                            pendingUtilities > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-foreground'
                                        )}>
                                            {formatCurrency(totalUtilityBalance)}
                                        </span>
                                    </div>
                                </Link>
                            </div>

                            <div className="mt-4 pt-4 border-t border-border/50 flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Outstanding</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold tracking-tight text-foreground">
                                        {formatCurrency((current_month_bill?.outstanding_amount ?? 0) + totalUtilityBalance)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Access Section */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-lg font-semibold tracking-tight">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <QuickAction label="Make Payment" icon={CreditCard} href={route('tenant.payments.make')} />
                        <QuickAction label="Rent Bills" icon={Receipt} href={route('tenant.rent-bills.index')} />
                        <QuickAction label="Utilities" icon={Zap} href={route('tenant.utilities')} />
                        <QuickAction label="Messages" icon={MessageCircleMore} href="#" />
                    </div>
                </div>

                {/* Notifications Hint if active alerts */}
                {(current_month_bill?.status === 'overdue' || pendingUtilities > 0) && (
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-4 rounded-xl flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold">Action Required</p>
                            <p className="text-xs mt-1">Pending balances may lead to service interruptions. Please review your bills.</p>
                        </div>
                    </div>
                )}
            </section>
        </div>

        {/* Footer / Logout */}
        <div className="mt-auto pt-8 flex justify-center">
            <Button variant="ghost" size="sm" onClick={() => router.post('/logout')} className="text-muted-foreground hover:text-foreground">
                Sign out of portal
            </Button>
        </div>

    </main>
  );
}

TenantDashboard.layout = (page: React.ReactNode) => <TenantLayout>{page}</TenantLayout>;
