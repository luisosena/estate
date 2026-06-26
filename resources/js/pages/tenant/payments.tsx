import { Link, router } from '@inertiajs/react';
import { CreditCard, Plus, Clock, CheckCircle2, AlertCircle, FileText, TrendingUp, History, Info } from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
import { ReceiptDownloadButton } from '@/components/payments/ReceiptDownloadButton';
import Pagination from '@/components/shared/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Payment {
  id: number;
  amount: number;
  payment_type: string;
  payment_method: string;
  status: 'paid' | 'partial' | 'pending' | 'overdue' | 'cancelled';
  paid_at: string;
  reference_number: string;
  notes: string;
}

interface TenantPaymentsProps {
  tenant: {
    id: number;
    full_name: string;
  };
  tenancy: {
    id: number;
    monthly_rent: number;
  } | null;
  payments: {
    data: Payment[];
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
  pendingAmount: number;
}

const formatDate = (dateString: string | null) => {
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
    case 'failed':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function TenantPayments({ tenant, tenancy, payments, pendingAmount }: TenantPaymentsProps) {
  const paymentList = payments?.data || [];
  const meta = payments?.meta || { total: 0, links: [] as any[] };
  const links = meta.links || [];

  return (
        <main className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px] bg-card font-bold text-muted-foreground border-border/50 flex gap-1.5 items-center uppercase tracking-widest">
                  <CreditCard className="w-3 h-3" />
                  Financials
                </Badge>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-foreground">
                Payment History
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Overview of your rent and utility settlements
              </p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
               <Button asChild className="font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20">
                 <Link href={route('tenant.payments.make')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Make Payment
                 </Link>
               </Button>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-8">
            {/* Financial Overview Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-border/50 shadow-none bg-primary/5 border-primary/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-20 w-20" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary">Monthly Obligation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-primary">
                    {formatCurrency(tenancy?.monthly_rent || 0)}
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Scheduled Rent Amount</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-none bg-destructive/5 border-destructive/10 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Clock className="h-20 w-20" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-destructive">Pending Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-destructive">
                    {formatCurrency(pendingAmount)}
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Outstanding for current cycle</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-none bg-success/5 border-success/10 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <History className="h-20 w-20" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-success">Lifetime Ledger</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-success">
                    {meta.total}
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Confirmed transactions</p>
                </CardContent>
              </Card>
            </div>

            {/* Transactions List */}
            <Card className="border-border/50 shadow-sm overflow-hidden border-none rounded-none bg-transparent">
              <CardHeader className="px-0 pt-0 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black">Transaction Ledger</CardTitle>
                        <CardDescription className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Historical record of all verified payments</CardDescription>
                    </div>
                  </div>
              </CardHeader>
              <CardContent className="px-0">
                <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead>
                        <tr className="border-b bg-muted/30 transition-colors">
                          <th className="h-12 px-6 text-left align-middle font-black text-muted-foreground text-[10px] uppercase tracking-widest">
                            Date
                          </th>
                          <th className="h-12 px-6 text-left align-middle font-black text-muted-foreground text-[10px] uppercase tracking-widest">
                            Category
                          </th>
                          <th className="h-12 px-6 text-left align-middle font-black text-muted-foreground text-[10px] uppercase tracking-widest">
                            Method
                          </th>
                          <th className="h-12 px-6 text-left align-middle font-black text-muted-foreground text-[10px] uppercase tracking-widest">
                            Ref #
                          </th>
                          <th className="h-12 px-6 text-left align-middle font-black text-muted-foreground text-[10px] uppercase tracking-widest">
                            Amount
                          </th>
                          <th className="h-12 px-6 text-left align-middle font-black text-muted-foreground text-[10px] uppercase tracking-widest">
                            Status
                          </th>
                          <th className="h-12 px-6 text-left align-middle font-black text-muted-foreground text-[10px] uppercase tracking-widest">
                            Receipt
                          </th>
                          <th className="h-12 px-6 text-right align-middle font-black text-muted-foreground text-[10px] uppercase tracking-widest">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {paymentList.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-16 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <FileText className="h-10 w-10 text-muted-foreground/30 mb-2" />
                                <span className="text-sm font-bold text-muted-foreground">No transactions found.</span>
                                <Button asChild variant="link" size="sm" className="text-primary font-bold uppercase tracking-widest text-[10px]">
                                    <Link href={route('tenant.payments.make')}>Initiate your first settlement</Link>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          paymentList.map((payment) => (
                            <tr
                              key={payment.id}
                              className="group transition-colors hover:bg-muted/30"
                            >
                              <td className="p-6 align-middle">
                                <div className="font-black text-sm text-foreground">
                                  {formatDate(payment.paid_at)}
                                </div>
                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                                    Finalized
                                </div>
                              </td>
                              <td className="p-6 align-middle">
                                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-border/50 bg-background/50 h-5">
                                  {payment.payment_type}
                                </Badge>
                              </td>
                              <td className="p-6 align-middle">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                  {payment.payment_method.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="p-6 align-middle">
                                <code className="text-[10px] font-black tracking-tight text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-sm">
                                  {payment.reference_number || 'N/A'}
                                </code>
                              </td>
                              <td className="p-6 align-middle">
                                <div className="font-black text-sm text-foreground">
                                  {formatCurrency(payment.amount)}
                                </div>
                              </td>
                              <td className="p-6 align-middle">
                                {(() => {
                                  const variant = getStatusVariant(payment.status);
                                  const labels: Record<string, string> = { paid: 'Paid', pending: 'Processing', partial: 'Partial', failed: 'Failed' };
                                  const icons: Record<string, any> = { paid: CheckCircle2, pending: Clock, partial: Info, failed: AlertCircle };
                                  const Icon = icons[payment.status];
                                  return (
                                    <Badge variant={variant}>
                                      {Icon && <Icon className="mr-1 h-3 w-3" />}
                                      {labels[payment.status] ?? payment.status}
                                    </Badge>
                                  );
                                })()}
                              </td>
                              <td className="p-6 align-middle">
                                <ReceiptDownloadButton
                                  paymentId={payment.id}
                                  paymentStatus={payment.status}
                                  size="sm"
                                  variant="outline"
                                />
                              </td>
                              <td className="p-6 align-middle text-right">
                                <Button asChild variant="ghost" size="sm" className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest text-primary hover:bg-primary/5">
                                  <Link href={route('tenant.payments.make', { paymentId: payment.id })}>
                                    Edit
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
                        Showing volume of {paymentList.length} of {meta.total} records
                    </p>
                    <Pagination links={links} />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
  );
}

TenantPayments.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
