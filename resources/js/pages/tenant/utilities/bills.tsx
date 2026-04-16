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
} from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
import { MetricCard } from '@/components/shared/DashboardComponents';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate, getFormattedDate, getStatusVariant } from '@/lib/formatters';
import { type SharedData } from '@/types';

interface Tenant {
  id: number;
  full_name: string;
}

interface UtilityType {
  id: number;
  name: string;
}

interface TenancyUtility {
  id: number;
  utility_type: UtilityType;
}

interface Payment {
  id: number;
  amount: number;
}

interface UtilityBill {
  id: number;
  billing_month: string;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  status: string;
  tenancy_utility: TenancyUtility;
  payments: Payment[];
}

interface Props {
  tenant: Tenant;
  tenancy?: {
    id: number;
  };
  bills: {
    data: UtilityBill[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
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


export default function TenantUtilityBills({
  tenant,
  tenancy,
  bills,
  summary,
  filters,
}: Props) {
  const { auth } = usePage<SharedData>().props;

  return (
    <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
        
        {/* Header Section */}
        <header className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="-ml-2 h-8 text-muted-foreground hover:text-foreground">
                    <Link href={route('tenant.utilities')}>
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back to Utilities
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <SidebarTrigger className="-ml-2 md:hidden" />
                        <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
                            <CalendarDays className="w-3 h-3" />
                            {getFormattedDate()}
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                        Utility Invoices
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Comprehensive ledger of all provisioned service billings and payments.
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Button asChild variant="outline" className="bg-card border-border/50 shadow-sm">
                        <Link href={route('tenant.payments')}>
                            <TrendingDown className="w-4 h-4 mr-2 text-muted-foreground" />
                            Global Ledger
                        </Link>
                    </Button>
                    <Button asChild className="shadow-sm">
                        <Link href={route('tenant.payments.make')}>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Settle Balances
                        </Link>
                    </Button>
                </div>
            </div>
        </header>

        {/* No Tenancy State */}
        {!tenancy ? (
            <Card className="shadow-none border-dashed border-2">
                <CardContent className="py-20 text-center flex flex-col items-center gap-4">
                    <Receipt className="h-12 w-12 text-muted-foreground opacity-20" />
                    <div>
                        <h3 className="text-xl font-semibold">No active tenancy</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mt-1">
                            Utility billing is only active for verified tenants with signed leases.
                        </p>
                    </div>
                </CardContent>
            </Card>
        ) : (
          <>
            {/* KPI Highlights */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Outstanding"
                    value={formatCurrency(summary.total_outstanding)}
                    icon={Receipt}
                    description="Aggregate payable amount"
                    alert={summary.total_outstanding > 0}
                />
                <MetricCard
                    title="Pending Cycle"
                    value={formatCurrency(summary.total_pending)}
                    icon={CalendarDays}
                    description="Current month obligations"
                />
                <MetricCard
                    title="Overdue Items"
                    value={formatCurrency(summary.total_overdue)}
                    icon={AlertCircle}
                    description="Bills past due date"
                    alert={summary.total_overdue > 0}
                />
                <MetricCard
                    title="Settlement Ratio"
                    value={summary.bill_count > 0 ? `${Math.round(((summary.bill_count - (summary.total_pending > 0 ? 1 : 0)) / summary.bill_count) * 100)}%` : '100%'}
                    icon={CheckCircle}
                    description="Historical on-time pay"
                />
            </section>

            {/* Ledger Table Section */}
            <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold tracking-tight">Billing Ledger</h2>
                    <Badge variant="outline" className="font-normal text-muted-foreground">
                        {summary.bill_count} records total
                    </Badge>
                </div>

                <Card className="shadow-none border-border/50 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="font-semibold px-6">Period</TableHead>
                                <TableHead className="font-semibold">Utility Type</TableHead>
                                <TableHead className="font-semibold text-right">Invoiced</TableHead>
                                <TableHead className="font-semibold text-right">Total Paid</TableHead>
                                <TableHead className="font-semibold">Due Date</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bills.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-40 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground py-10">
                                            <CheckCircle className="mb-4 h-12 w-12 opacity-20 text-green-500" />
                                            <p className="text-lg font-medium">All systems green</p>
                                            <p className="text-sm">No utility billings found in your ledger yet.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                bills.data.map((bill) => {
                                    const isOverdue = bill.status === 'overdue' || (bill.status === 'pending' && new Date(bill.due_date) < new Date());
                                    return (
                                        <TableRow key={bill.id} className="group hover:bg-muted/20 transition-colors">
                                            <TableCell className="px-6 font-medium">
                                                {formatDate(bill.billing_month)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="capitalize bg-muted/50 font-medium">
                                                        {bill.tenancy_utility?.utility_type?.name || 'Service'}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-foreground">
                                                {formatCurrency(bill.amount_due)}
                                            </TableCell>
                                            <TableCell className="text-right text-green-600 dark:text-green-500 font-medium">
                                                {formatCurrency(bill.amount_paid)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "text-sm",
                                                        isOverdue ? "text-destructive font-bold" : "text-muted-foreground font-medium"
                                                    )}>
                                                        {formatDate(bill.due_date)}
                                                    </span>
                                                    {isOverdue && <AlertCircle className="h-3 w-3 text-destructive animate-pulse" />}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(bill.status)} className="capitalize px-3 py-0.5 shadow-none rounded-full">
                                                    {bill.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {bills.last_page > 1 && (
                        <div className="p-4 border-t border-border/40 flex items-center justify-between bg-muted/10">
                            <div className="text-xs text-muted-foreground font-medium uppercase">
                                Page {bills.current_page} of {bills.last_page}
                            </div>
                            <div className="flex gap-1.5">
                                {bills.links.map((link, idx) => (
                                    <Button
                                        key={idx}
                                        variant={link.active ? "default" : "outline"}
                                        size="sm"
                                        className="h-8 min-w-[2rem] px-2 shadow-sm"
                                        asChild={!!link.url}
                                        disabled={!link.url}
                                    >
                                        {link.url ? (
                                            <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label.replace('&laquo;', '').replace('&raquo;', '').trim() || (idx === 0 ? 'Prev' : 'Next') }} />
                                        ) : (
                                            <span dangerouslySetInnerHTML={{ __html: link.label.replace('&laquo;', '').replace('&raquo;', '').trim() || (idx === 0 ? 'Prev' : 'Next') }} />
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </section>

            {/* Support Hint */}
            <div className="bg-muted/40 border p-5 rounded-2xl flex gap-4 items-start">
                <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-foreground">Understanding your utility ledger</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        This ledger tracks billings for services provisioned by the building management. If you notice a discrepancy between your consumption and billable amount, please raise a support ticket under "Utility Dispute" for a detailed meter audit.
                    </p>
                </div>
            </div>
          </>
        )}

    </main>
  );
}


TenantUtilityBills.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
