import { Link, router } from '@inertiajs/react';
import { FileText, CreditCard, Clock, CheckCircle2, AlertCircle, Calendar, ArrowRight, Wallet, Info } from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
import Pagination from '@/components/shared/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RentBill {
  id: number;
  billing_month: string;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  status: 'pending' | 'paid' | 'partial' | 'overdue' | 'waived';
  outstanding_amount: number;
  tenancy?: {
    unit?: {
      unit_name: string;
      property?: {
        name: string;
      };
    };
  };
}

interface IndexProps {
  rentBills: {
    data: RentBill[];
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    meta: {
      current_page: number;
      total: number;
      links: Array<{
        url: string | null;
        label: string;
        active: boolean;
      }>;
    };
  } | null;
  currentMonthBill: RentBill | null;
  stats: {
    total: number;
    pending: number;
    paid: number;
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

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
  }).format(amount);

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'paid':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'partial':
      return 'outline';
    case 'overdue':
      return 'destructive';
    case 'waived':
      return 'outline';
    default:
      return 'outline';
  }
};

export default function RentBillsIndex({ rentBills, currentMonthBill, stats }: IndexProps) {
  const billList = rentBills?.data || [];
  const meta = rentBills?.meta || { total: 0, links: [] as any[] };
  const links = meta.links || [];

  return (
        <main className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px] bg-card font-bold text-muted-foreground border-border/50 flex gap-1.5 items-center uppercase tracking-widest">
                  <FileText className="w-3 h-3" />
                  Obligations
                </Badge>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-foreground">
                Rent Invoices
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Track your rent periods and payment statuses
              </p>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-8">
            {/* Current Month & Stats */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2 border-primary/20 bg-primary/[0.02] shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                    <Calendar className="h-32 w-32" />
                </div>
                <CardHeader>
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Active Billing Period</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentMonthBill ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div>
                        <div className="text-4xl font-black text-foreground mb-1">
                          {formatDate(currentMonthBill.billing_month)}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                Due {formatFullDate(currentMonthBill.due_date)}
                            </span>
                            {(() => {
                              const labels: Record<string, string> = { paid: 'Settled', pending: 'Outstanding', partial: 'Partial', overdue: 'Past Due', waived: 'Waived' };
                              const icons: Record<string, any> = { paid: CheckCircle2, pending: Clock, partial: Info, overdue: AlertCircle };
                              const Icon = icons[currentMonthBill.status];
                              return (
                                <Badge variant={getStatusVariant(currentMonthBill.status)}>
                                  {Icon && <Icon className="mr-1 h-3 w-3" />}
                                  {labels[currentMonthBill.status] ?? currentMonthBill.status}
                                </Badge>
                              );
                            })()}
                        </div>
                      </div>
                      <div className="flex flex-col items-start sm:items-end">
                        <div className="text-2xl font-black text-foreground">
                          {formatCurrency(currentMonthBill.outstanding_amount)}
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Remaining Balance</p>
                        <Button asChild className="mt-4 font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20">
                            <Link href={route('tenant.payments.make', { paymentId: currentMonthBill.id })}>
                                Pay Now
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 flex flex-col items-center justify-center text-center">
                        <Wallet className="h-10 w-10 text-muted-foreground/30 mb-3" />
                        <h3 className="text-sm font-bold text-foreground">No active bill for this period</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">You are all caught up!</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid gap-4">
                  <Card className="border-border/50 shadow-none bg-muted/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Invoiced</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-black">{stats.total}</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-border/50 shadow-none bg-destructive/5 border-destructive/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <CardTitle className="text-[10px] font-black uppercase tracking-widest text-destructive">Action Required</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-black text-destructive">{stats.pending}</div>
                    </CardContent>
                  </Card>
              </div>
            </div>

            {/* Invoices List */}
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="px-0 pt-0 pb-4">
                <CardTitle className="text-xl font-black">Billing Ledger</CardTitle>
                <CardDescription className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Historical breakdown of your rent obligations</CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead>
                        <tr className="border-b bg-muted/30 transition-colors">
                          <th className="h-12 px-6 text-left align-middle font-black text-muted-foreground text-[10px] uppercase tracking-widest">
                            Billing Period
                          </th>
                          <th className="h-12 px-6 text-left align-middle font-black text-muted-foreground text-[10px] uppercase tracking-widest">
                            Invoice Amount
                          </th>
                          <th className="h-12 px-6 text-left align-middle font-black text-muted-foreground text-[10px] uppercase tracking-widest">
                            Settled
                          </th>
                          <th className="h-12 px-6 text-left align-middle font-black text-muted-foreground text-[10px] uppercase tracking-widest">
                            Balance
                          </th>
                          <th className="h-12 px-6 text-left align-middle font-black text-muted-foreground text-[10px] uppercase tracking-widest">
                            Deadline
                          </th>
                          <th className="h-12 px-6 text-left align-middle font-black text-muted-foreground text-[10px] uppercase tracking-widest">
                            Status
                          </th>
                          <th className="h-12 px-6 text-right align-middle font-black text-muted-foreground text-[10px] uppercase tracking-widest">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {billList.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-16 text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <FileText className="h-10 w-10 text-muted-foreground/30 mb-2" />
                                    <span className="text-sm font-bold text-muted-foreground">No invoices found.</span>
                                </div>
                            </td>
                          </tr>
                        ) : (
                          billList.map((bill) => (
                            <tr
                              key={bill.id}
                              className="group transition-colors hover:bg-muted/30"
                            >
                              <td className="p-6 align-middle">
                                <div className="font-black text-sm text-foreground uppercase">
                                  {formatDate(bill.billing_month)}
                                </div>
                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                                    Rent Period
                                </div>
                              </td>
                              <td className="p-6 align-middle">
                                <div className="font-bold text-sm text-foreground">
                                  {formatCurrency(bill.amount_due)}
                                </div>
                              </td>
                              <td className="p-6 align-middle">
                                <div className="font-medium text-sm text-success">
                                  {formatCurrency(bill.amount_paid)}
                                </div>
                              </td>
                              <td className="p-6 align-middle">
                                <div className={`font-black text-sm ${bill.outstanding_amount > 0 ? 'text-destructive' : 'text-foreground'}`}>
                                  {formatCurrency(bill.outstanding_amount)}
                                </div>
                              </td>
                              <td className="p-6 align-middle">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-foreground">
                                        {formatFullDate(bill.due_date)}
                                    </span>
                                </div>
                              </td>
                              <td className="p-6 align-middle">
                                {(() => {
                                  const labels: Record<string, string> = { paid: 'Settled', pending: 'Outstanding', partial: 'Partial', overdue: 'Past Due', waived: 'Waived' };
                                  const icons: Record<string, any> = { paid: CheckCircle2, pending: Clock, partial: Info, overdue: AlertCircle };
                                  const Icon = icons[bill.status];
                                  return (
                                    <Badge variant={getStatusVariant(bill.status)}>
                                      {Icon && <Icon className="mr-1 h-3 w-3" />}
                                      {labels[bill.status] ?? bill.status}
                                    </Badge>
                                  );
                                })()}
                              </td>
                              <td className="p-6 align-middle text-right">
                                <Button asChild variant="ghost" size="sm" className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest text-primary hover:bg-primary/5">
                                  <Link href={route('tenant.rent-bills.show', bill.id)}>
                                    Details
                                  </Link>
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Consolidated History: {meta.total} Invoices
                    </p>
                    <Pagination links={links} />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
  );
}

RentBillsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
