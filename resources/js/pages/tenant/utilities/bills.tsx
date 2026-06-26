import { Link, usePage } from '@inertiajs/react';
import {
  CreditCard,
  AlertCircle,
  CheckCircle,
  Receipt,
  ChevronLeft,
  CalendarDays,
  TrendingDown,
  Info,
  CheckCircle2,
  Clock
} from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
import { MetricCard } from '@/components/shared/DashboardComponents';
import Pagination from '@/components/shared/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';

interface UtilityType {
  id: number;
  name: string;
}

interface TenancyUtility {
  id: number;
  utility_type: UtilityType;
}

interface UtilityBill {
  id: number;
  billing_month: string;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  status: string;
  tenancy_utility: TenancyUtility;
  outstanding_amount: number;
}

interface Props {
  tenant: {
    id: number;
    full_name: string;
  };
  tenancy?: {
    id: number;
  };
  bills: {
    data: UtilityBill[];
    meta: {
      current_page: number;
      total: number;
      links: Array<{
        url: string | null;
        label: string;
        active: boolean;
      }>;
    };
  };
  summary: {
    total_outstanding: number;
    total_pending: number;
    total_overdue: number;
    total_partial: number;
    bill_count: number;
  };
  filters: {
    status: string;
  };
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
};

const formatFullDate = (dateString: string | null) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'overdue':
      return 'destructive';
    case 'partial':
      return 'outline';
    default:
      return 'outline';
  }
};

const getStatusLabel = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return { label: 'Paid', icon: CheckCircle2 };
    case 'pending':
      return { label: 'Pending', icon: Clock };
    case 'overdue':
      return { label: 'Overdue', icon: AlertCircle };
    case 'partial':
      return { label: 'Partial', icon: Clock };
    default:
      return { label: status, icon: null };
  }
};

export default function TenantUtilityBills({
  tenant,
  tenancy,
  bills,
  summary,
  filters,
}: Props) {
  const { auth } = usePage<SharedData>().props;
  const { data: billList, meta } = bills;
  const links = meta.links || [];

  return (
    <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
        
        {/* Header Section */}
        <header className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="-ml-2 h-8 text-muted-foreground hover:text-foreground font-bold text-[10px] uppercase tracking-widest gap-2">
                    <Link href={route('tenant.utilities')}>
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Infrastructure
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <SidebarTrigger className="-ml-2 md:hidden" />
                        <Badge variant="outline" className="text-[10px] bg-card font-black text-muted-foreground border-border/50 flex gap-1.5 items-center uppercase tracking-widest">
                            <Receipt className="w-3 h-3" />
                            Utility Ledger
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">
                        Service Logs
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Complete historical breakdown of your provisioned service billings.
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Button asChild variant="outline" className="bg-card border-border/50 shadow-sm font-bold text-xs uppercase tracking-widest gap-2">
                        <Link href={route('tenant.payments')}>
                            <TrendingDown className="w-4 h-4 opacity-70" />
                            Full History
                        </Link>
                    </Button>
                    <Button asChild className="shadow-lg shadow-primary/20 font-bold text-xs uppercase tracking-widest gap-2">
                        <Link href={route('tenant.payments.make')}>
                            <CreditCard className="w-4 h-4" />
                            Resolve Balances
                        </Link>
                    </Button>
                </div>
            </div>
        </header>

        {/* No Tenancy State */}
        {!tenancy ? (
            <Card className="shadow-none border-dashed border-2 border-border/50 bg-muted/5">
                <CardContent className="py-24 text-center flex flex-col items-center gap-4">
                    <Receipt className="h-12 w-12 text-muted-foreground opacity-20" />
                    <div className="max-w-xs">
                        <h3 className="text-sm font-black uppercase tracking-widest">No Operational History</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter mt-1 opacity-70">
                            Billing records are generated for active tenancies. Please finalize your unit onboarding.
                        </p>
                    </div>
                </CardContent>
            </Card>
        ) : (
          <>
            {/* KPI Highlights */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Payable Pipeline"
                    value={formatCurrency(summary.total_outstanding)}
                    icon={Receipt}
                    description="Total across all cycles"
                    alert={summary.total_outstanding > 0}
                />
                <MetricCard
                    title="Current Demands"
                    value={formatCurrency(summary.total_pending)}
                    icon={CalendarDays}
                    description="Active billing month"
                />
                <MetricCard
                    title="Escalated Items"
                    value={formatCurrency(summary.total_overdue)}
                    icon={AlertCircle}
                    description="Invoices past deadline"
                    alert={summary.total_overdue > 0}
                />
                <MetricCard
                    title="Settlement Performance"
                    value={summary.bill_count > 0 ? `${Math.round(((summary.bill_count - (summary.total_overdue > 0 ? 1 : 0)) / summary.bill_count) * 100)}%` : '100%'}
                    icon={CheckCircle}
                    description="Historical reliability"
                />
            </section>

            {/* Ledger Table Section */}
            <section className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black tracking-tight">Financial Stream</h2>
                    <div className="px-3 py-1 bg-background rounded-full text-[10px] font-black text-muted-foreground uppercase tracking-widest border border-border/50">
                        {summary.bill_count} Records Discovered
                    </div>
                </div>

                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <div className="relative w-full overflow-auto">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="border-b transition-colors hover:bg-muted/50">
                                    <TableHead className="h-10 px-6 text-left align-middle font-black text-muted-foreground text-[10px] uppercase tracking-widest">Period</TableHead>
                                    <TableHead className="h-10 px-4 text-left align-middle font-black text-muted-foreground text-[10px] uppercase tracking-widest">Category</TableHead>
                                    <TableHead className="h-10 px-4 text-right align-middle font-black text-muted-foreground text-[10px] uppercase tracking-widest">Requested</TableHead>
                                    <TableHead className="h-10 px-4 text-right align-middle font-black text-muted-foreground text-[10px] uppercase tracking-widest">Settled</TableHead>
                                    <TableHead className="h-10 px-4 text-left align-middle font-black text-muted-foreground text-[10px] uppercase tracking-widest">Deadline</TableHead>
                                    <TableHead className="h-10 px-6 text-right align-middle font-black text-muted-foreground text-[10px] uppercase tracking-widest">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="text-xs [&_tr:last-child]:border-0">
                                {billList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="p-24 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4 opacity-30">
                                                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                                                <div className="max-w-xs">
                                                    <p className="text-sm font-black uppercase tracking-widest">Stream Synchronized</p>
                                                    <p className="text-[10px] font-bold uppercase tracking-tighter mt-1">No utility invoicing records identified in your ledger.</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    billList.map((bill) => {
                                        const isOverdue = bill.status === 'overdue' || (bill.status === 'pending' && new Date(bill.due_date) < new Date());
                                        return (
                                            <TableRow key={bill.id} className="border-b transition-colors hover:bg-muted/20">
                                                <TableCell className="p-6 align-middle font-black uppercase text-foreground">
                                                    {formatDate(bill.billing_month)}
                                                </TableCell>
                                                <TableCell className="p-4 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-muted/50 border-border/30 h-5 px-2">
                                                            {bill.tenancy_utility?.utility_type?.name || 'Service'}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="p-4 align-middle text-right font-black text-foreground">
                                                    {formatCurrency(bill.amount_due)}
                                                </TableCell>
                                                <TableCell className="p-4 align-middle text-right text-success font-bold">
                                                    {formatCurrency(bill.amount_paid)}
                                                </TableCell>
                                                <TableCell className="p-4 align-middle whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "font-bold",
                                                            isOverdue ? "text-destructive font-black" : "text-muted-foreground"
                                                        )}>
                                                            {formatFullDate(bill.due_date)}
                                                        </span>
                                                        {isOverdue && <AlertCircle className="h-3 w-3 text-destructive animate-pulse" />}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="p-6 align-middle text-right">
                                                    {(() => {
                                                        const { label, icon: Icon } = getStatusLabel(bill.status);
                                                        return (
                                                            <Badge variant={getStatusVariant(bill.status)} className="font-bold text-[10px] uppercase tracking-widest px-2 shadow-sm">
                                                                {Icon && <Icon className="mr-1 h-3 w-3" />}
                                                                {label}
                                                            </Badge>
                                                        );
                                                    })()}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="p-6 border-t border-border/30 bg-muted/5">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                Financial Asset Portfolio: {meta.total} Billing Artifacts
                            </p>
                            <Pagination links={links} />
                        </div>
                    </div>
                </Card>
            </section>

            {/* Advisory Section */}
            <Card className="border-none shadow-none bg-muted/10 border-l-[3px] border-l-muted-foreground rounded-none overflow-hidden">
                <CardContent className="p-6 flex gap-4 items-start">
                    <div className="p-2 bg-background border border-border/50 rounded-lg">
                        <Info className="w-5 h-5 text-muted-foreground shrink-0" />
                    </div>
                    <div className="space-y-1">
                        <h5 className="text-xs font-black uppercase tracking-widest text-foreground">Financial Transparency Notice</h5>
                        <p className="text-[10px] font-bold text-muted-foreground leading-relaxed uppercase tracking-tighter opacity-70">
                            Service logs track building-level provisioned utilities. Discrepancies between consumption and billing should be addressed via a support ticket. Historically settled invoices are archived for taxation and audit verification.
                        </p>
                    </div>
                </CardContent>
            </Card>
          </>
        )}

    </main>
  );
}

TenantUtilityBills.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
