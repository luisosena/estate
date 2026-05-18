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
  FileText,
  Download,
} from 'lucide-react';
import React, { useMemo } from 'react';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
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
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  read_at: string | null;
  created_at: string;
  data: any;
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

interface Document {
  id: number;
  file_name: string;
  file_type: string;
  file_size: number;
  category: string;
  uploaded_at: string;
}

interface TenantDashboardProps {
  tenant: { data: Tenant };
  payments?: { data: Payment[] };
  unit?: Unit | null;
  tenancy?: Tenancy | null;
  utilities?: { data: Utility[] };
  notifications?: { data: Notification[] };
  rent_bills?: { data: RentBill[] };
  current_month_bill?: { data: RentBill | null };
  documents?: { data: Document[] };
}


/* ─── Main Component ─────────────────────────────────────────────── */

export default function TenantDashboard({
  payments = { data: [] },
  tenant = { data: { id: 0, full_name: '' } },
  unit = null,
  tenancy = null,
  utilities = { data: [] },
  notifications = { data: [] },
  rent_bills = { data: [] },
  current_month_bill = { data: null },
  documents = { data: [] },
}: TenantDashboardProps) {
  const { auth } = usePage<SharedData>().props;
  const tenantData = tenant.data;
  const paymentList = payments.data;
  const utilityList = utilities.data;
  const notificationList = notifications.data;
  const currentBill = current_month_bill?.data;

  const firstName = tenantData.full_name.split(' ')[0] ?? 'User';

  const totalUtilityBalance = useMemo(() => 
    utilityList.reduce((sum, u) => {
      // Use the calculated balance if available, otherwise fallback to amount
      const balance = (u as any).pending_balance ?? u.amount;
      const status = (u as any).calculated_status ?? u.status ?? 'pending';
      if (status.toLowerCase() !== 'paid') return sum + balance;
      return sum;
    }, 0),
    [utilityList]
  );

  const pendingUtilities = useMemo(() => 
    utilityList.filter(
      (u) => (((u as any).calculated_status ?? u.status) ?? 'pending').toLowerCase() !== 'paid',
    ).length,
    [utilityList]
  );

  const unreadNotificationsCount = useMemo(() => 
    notificationList.filter((n) => !n.read_at).length,
    [notificationList]
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
                <Button asChild variant="outline" size="sm" className="bg-card border-border/50 shadow-sm hover:bg-accent hidden sm:flex">
                    <a href={route('tenant.dashboard.export.csv')}>
                        Export CSV
                    </a>
                </Button>
                <Button asChild variant="outline" size="sm" className="bg-card border-border/50 shadow-sm hover:bg-accent hidden sm:flex">
                    <a href={route('tenant.dashboard.export.pdf')}>
                        Export PDF
                    </a>
                </Button>
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
                value={formatCurrency(currentBill?.outstanding_amount ?? 0)}
                icon={Receipt}
                description={currentBill ? `Due: ${formatDate(currentBill.due_date)}` : 'No bills found'}
                alert={currentBill?.status === 'overdue'}
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
                    <LastPaymentsTable payments={paymentList} />
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
                        <UtilitiesTable utilities={utilityList} />
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
                                        currentBill?.status === 'overdue' 
                                            ? 'bg-red-50 hover:bg-red-100 border-red-200 dark:bg-red-950/20 dark:border-red-900/30' 
                                            : 'bg-card hover:bg-muted/50 border-border/60'
                                    )}
                                >
                                    <span className={cn(
                                        "text-xs font-semibold mb-2 flex items-center gap-1.5",
                                        currentBill?.status === 'overdue' ? 'text-red-700 dark:text-red-400' : 'text-muted-foreground'
                                    )}>
                                        {currentBill?.status === 'overdue' ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5 text-amber-500" />}
                                        Rent: {currentBill?.status ?? 'No Bill'}
                                    </span>
                                    <div className="flex justify-between items-end">
                                        <span className={cn(
                                            "text-2xl font-bold",
                                            currentBill?.status === 'overdue' ? 'text-red-700 dark:text-red-400' : 'text-foreground'
                                        )}>
                                            {formatCurrency(currentBill?.outstanding_amount ?? 0)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">Due {formatDate(currentBill?.due_date)}</span>
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
                                        {formatCurrency((currentBill?.outstanding_amount ?? 0) + totalUtilityBalance)}
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

                {/* Documents Section */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-lg font-semibold tracking-tight">Documents</h2>
                    <Card className="bg-card shadow-sm border-border/50">
                        <CardContent className="px-5 py-4 flex flex-col gap-3">
                            {documents.data.length > 0 ? (
                                documents.data.map((doc) => (
                                    <a
                                        key={doc.id}
                                        href={route('tenant.documents.download', { document: doc.id })}
                                        className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-muted/50 transition-colors"
                                    >
                                        <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{doc.file_name}</p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {doc.category.replace('_', ' ')}
                                            </p>
                                        </div>
                                        <Download className="w-4 h-4 text-muted-foreground shrink-0" />
                                    </a>
                                ))
                            ) : (
                                <div className="text-center py-4">
                                    <FileText className="mx-auto h-8 w-8 text-muted-foreground/50" />
                                    <p className="text-sm text-muted-foreground mt-2">No documents yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Notifications Hint if active alerts */}
                {(currentBill?.status === 'overdue' || pendingUtilities > 0) && (
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

TenantDashboard.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
