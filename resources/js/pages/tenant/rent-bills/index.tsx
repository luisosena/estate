import { Link, router, usePage } from '@inertiajs/react';
import { 
  MoreHorizontal, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Receipt,
  CalendarDays,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

import TenantLayout from '@/components/layout/TenantLayout';
import { MetricCard } from '@/components/shared/DashboardComponents';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { formatCurrency, formatDate, getFormattedDate } from '@/lib/formatters';
import { type SharedData } from '@/types';

interface RentBill {
  id: number;
  billing_month: string;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  status: 'pending' | 'paid' | 'partial' | 'overdue' | 'waived';
  outstanding_amount: number;
}

interface Stats {
  total: number;
  pending: number;
  paid: number;
}

interface Props {
  rentBills: {
    data: RentBill[];
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
  currentMonthBill: RentBill | null;
  stats: Stats;
}


const getStatusBadge = (status: string) => {
  switch (status) {
    case 'paid':
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600 shadow-none capitalize">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Paid
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="secondary" className="bg-amber-500 hover:bg-amber-600 text-white shadow-none capitalize">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
    case 'partial':
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-500 shadow-none capitalize">
          <Clock className="mr-1 h-3 w-3" />
          Partial
        </Badge>
      );
    case 'overdue':
      return (
        <Badge variant="destructive" className="shadow-none capitalize">
          <AlertCircle className="mr-1 h-3 w-3" />
          Overdue
        </Badge>
      );
    case 'waived':
      return (
        <Badge variant="outline" className="text-muted-foreground shadow-none capitalize">
          Waived
        </Badge>
      );
    default:
      return <Badge variant="outline" className="shadow-none capitalize">{status}</Badge>;
  }
};

export default function RentBillsIndex({ rentBills, currentMonthBill, stats }: Props) {
  const { auth } = usePage<SharedData>().props;

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
                    Rent Invoices
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your rental obligations and view historical billing data.
                </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <Button asChild variant="outline" className="bg-card border-border/50 shadow-sm hidden sm:flex">
                    <Link href={route('tenant.payments')}>
                        <TrendingDown className="w-4 h-4 mr-2 text-muted-foreground" />
                        Payment Records
                    </Link>
                </Button>
                <Button asChild className="shadow-sm">
                    <Link href={route('tenant.payments.make')}>
                        <Clock className="w-4 h-4 mr-2" />
                        Quick Pay
                    </Link>
                </Button>
            </div>
        </header>

        {/* Status Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
                title="Total Generated"
                value={stats.total}
                icon={Receipt}
                description="Total rent bills issued to date"
            />
            <MetricCard
                title="Pending Bills"
                value={stats.pending}
                icon={Clock}
                description="Awaiting full payment"
                alert={stats.pending > 0}
            />
            <MetricCard
                title="Settled Bills"
                value={stats.paid}
                icon={CheckCircle2}
                trend={{ label: "Good standing", value: "" }}
                description="Successfully paid in full"
            />
        </div>

        {/* Current Month Bill Spotlight */}
        {currentMonthBill && (
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold tracking-tight">Active Invoice</h2>
            <Card className={cn(
                "shadow-sm transition-all border-l-4",
                currentMonthBill.status === 'overdue' ? 'border-l-destructive' : 'border-l-primary'
            )}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Current Billing Period</CardTitle>
                  <CardDescription>{formatDate(currentMonthBill.billing_month)} cycle</CardDescription>
                </div>
                {getStatusBadge(currentMonthBill.status)}
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-3 mb-6">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground font-medium uppercase tracking-tight">Invoice Amount</div>
                    <div className="text-2xl font-bold">{formatCurrency(currentMonthBill.amount_due)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground font-medium uppercase tracking-tight">Already Paid</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-500">{formatCurrency(currentMonthBill.amount_paid)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground font-medium uppercase tracking-tight">Payable By</div>
                    <div className="text-2xl font-bold">{formatDate(currentMonthBill.due_date)}</div>
                  </div>
                </div>

                {currentMonthBill.outstanding_amount > 0 ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between rounded-2xl bg-muted/30 p-5 border border-border/50 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Remaining Balance</div>
                            <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">
                                {formatCurrency(currentMonthBill.outstanding_amount)}
                            </div>
                        </div>
                    </div>
                    <Button asChild size="lg" className="w-full sm:w-auto shadow-md">
                      <Link href={route('tenant.payments.make')}>
                        Complete Payment
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-2xl bg-green-50 dark:bg-green-950/20 p-5 border border-green-100 dark:border-green-900/30 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="font-semibold text-lg">Invoice fully settled for this period. Thank you!</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Ledger Table */}
        <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold tracking-tight">Invoicing History</h2>
            <Card className="shadow-none border-border/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow>
                            <TableHead className="font-semibold">Period</TableHead>
                            <TableHead className="font-semibold text-center">Amount Due</TableHead>
                            <TableHead className="font-semibold text-center">Paid</TableHead>
                            <TableHead className="font-semibold text-center">Balance</TableHead>
                            <TableHead className="font-semibold">Due Date</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rentBills.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-40 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground py-10">
                                        <Receipt className="mb-4 h-12 w-12 opacity-20" />
                                        <p className="text-lg font-medium">No billing history found</p>
                                        <p className="text-sm">Invoices will appear here once generated by your landlord.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            rentBills.data.map((bill) => (
                                <TableRow key={bill.id} className="group hover:bg-muted/20 transition-colors">
                                    <TableCell className="font-medium">
                                        {formatDate(bill.billing_month)}
                                    </TableCell>
                                    <TableCell className="text-center font-medium">
                                        {formatCurrency(bill.amount_due)}
                                    </TableCell>
                                    <TableCell className="text-center text-green-600 dark:text-green-500">
                                        {formatCurrency(bill.amount_paid)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={cn(
                                            "font-bold",
                                            bill.outstanding_amount > 0 ? "text-amber-600" : "text-green-600 dark:text-green-500"
                                        )}>
                                            {formatCurrency(bill.outstanding_amount)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatDate(bill.due_date)}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(bill.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="ghost" size="icon" className="group-hover:text-primary group-hover:bg-primary/5 transition-all">
                                            <Link href={route('tenant.rent-bills.show', bill.id)}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {rentBills.last_page > 1 && (
                    <div className="p-4 border-t border-border/40 flex items-center justify-between bg-muted/10">
                        <div className="text-xs text-muted-foreground font-medium uppercase">
                            Page {rentBills.current_page} of {rentBills.last_page}
                        </div>
                        <div className="flex gap-1.5">
                            {rentBills.links.map((link, idx) => (
                                <Button
                                    key={idx}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    className="h-8 min-w-[2rem] px-2 shadow-sm"
                                    asChild={!!link.url}
                                    disabled={!link.url}
                                >
                                    {link.url ? (
                                        <Link href={link.url}>
                                            {link.label.replace('&laquo;', '').replace('&raquo;', '').trim() || (idx === 0 ? 'Prev' : 'Next')}
                                        </Link>
                                    ) : (
                                        <span>{link.label.replace('&laquo;', '').replace('&raquo;', '').trim() || (idx === 0 ? 'Prev' : 'Next')}</span>
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </Card>
        </section>

    </main>
  );
}


RentBillsIndex.layout = (page: React.ReactNode) => <TenantLayout>{page}</TenantLayout>;
