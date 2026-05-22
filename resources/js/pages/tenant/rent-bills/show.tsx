import { Link, router, usePage } from '@inertiajs/react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Receipt, 
  Home, 
  DollarSign,
  CalendarDays,
  Info,
  CreditCard,
  Building2,
  MapPin,
  History,
} from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { formatCurrency, formatDate, getFormattedDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';

interface Property {
  id: number;
  name: string;
}

interface Unit {
  id: number;
  unit_name: string;
  unit_code: string;
  property: Property;
}

interface Payment {
  id: number;
  amount: number;
  payment_method: string;
  status: string;
  paid_at: string | null;
  reference_number: string | null;
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
  notes: string | null;
  tenancy: {
    unit: Unit;
  };
  payments: Payment[];
  created_at: string;
  updated_at: string;
}

interface Props {
  rentBill: RentBill;
}


const formatDateTime = (dateString: string | null) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getPaymentStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'paid':
      return <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-200 shadow-none capitalize">Completed</Badge>;
    case 'pending':
      return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-200 shadow-none capitalize">Pending</Badge>;
    case 'failed':
      return <Badge variant="destructive" className="shadow-none capitalize">Failed</Badge>;
    default:
      return <Badge variant="outline" className="shadow-none capitalize">{status}</Badge>;
  }
};

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
          Pending balance
        </Badge>
      );
    case 'partial':
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-500 shadow-none capitalize">
          <Clock className="mr-1 h-3 w-3" />
          Partially Paid
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

export default function RentBillShow({ rentBill }: Props) {
  const { auth } = usePage<SharedData>().props;
  const canPay = rentBill.status !== 'paid' && rentBill.status !== 'waived';

  return (
    <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
        
        {/* Header Section */}
        <header className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="-ml-2 h-8 text-muted-foreground hover:text-foreground">
                    <Link href={route('tenant.rent-bills.index')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Billing
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
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                            Invoice #{rentBill.id}
                        </h1>
                        {getStatusBadge(rentBill.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Detailed breakdown for the {formatDate(rentBill.billing_month)} billing cycle.
                    </p>
                </div>

                {canPay && (
                    <div className="flex items-center gap-2 shrink-0">
                        <Button asChild className="shadow-lg shadow-primary/20">
                            <Link href={route('tenant.payments.make')}>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Pay Outstanding Balance
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </header>

        {/* Main Dashboard-style Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Content Column */}
            <div className="lg:col-span-2 flex flex-col gap-8">
                
                {/* Financial Summary Card */}
                <Card className="shadow-none border-border/50">
                    <CardHeader className="bg-muted/10 border-b pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Billing Breakdown</CardTitle>
                                <CardDescription>Financial summary for this period</CardDescription>
                            </div>
                            <Receipt className="w-5 h-5 text-muted-foreground opacity-50" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Total Payable</span>
                                <span className="text-3xl font-bold">{formatCurrency(rentBill.amount_due)}</span>
                            </div>
                            <div className="flex flex-col gap-1 border-l sm:pl-8 border-border/50">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Paid Amount</span>
                                <span className="text-3xl font-bold text-green-600 dark:text-green-500">{formatCurrency(rentBill.amount_paid)}</span>
                            </div>
                            <div className="flex flex-col gap-1 border-l sm:pl-8 border-border/50">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Outstanding</span>
                                <span className={cn(
                                    "text-3xl font-bold",
                                    rentBill.outstanding_amount > 0 ? "text-amber-600" : "text-green-600"
                                )}>
                                    {formatCurrency(rentBill.outstanding_amount)}
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                Due By: <span className="font-semibold text-foreground">{formatDate(rentBill.due_date)}</span>
                            </div>
                            {rentBill.notes && (
                                <div className="text-muted-foreground flex items-center gap-2 italic">
                                    <Info className="w-4 h-4" />
                                    {rentBill.notes}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Transaction History */}
                <Card className="shadow-none border-border/50">
                    <CardHeader className="bg-muted/10 border-b">
                        <CardTitle className="text-lg flex items-center gap-2">
                           <History className="w-5 h-5 text-primary" />
                           Associated Transactions
                        </CardTitle>
                        <CardDescription>Payments recorded against this invoice</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {rentBill.payments && rentBill.payments.length > 0 ? (
                            <div className="divide-y divide-border/50">
                                {rentBill.payments.map((payment) => (
                                    <div key={payment.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                                                <DollarSign className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg">{formatCurrency(payment.amount)}</p>
                                                <p className="text-xs text-muted-foreground uppercase font-medium tracking-tight">
                                                    {payment.payment_method.replace('_', ' ')} • {formatDateTime(payment.paid_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 justify-between sm:justify-end">
                                            {payment.reference_number && (
                                                <code className="text-[10px] bg-muted px-2 py-0.5 rounded border">
                                                    Ref: {payment.reference_number}
                                                </code>
                                            )}
                                            {getPaymentStatusBadge(payment.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center flex flex-col items-center gap-3">
                                <DollarSign className="w-12 h-12 text-muted-foreground opacity-20" />
                                <p className="text-muted-foreground">No payments linked to this bill yet.</p>
                                {canPay && (
                                    <Button asChild variant="outline" size="sm" className="mt-2">
                                        <Link href={route('tenant.payments.make')}>Initiate Payment</Link>
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>

            {/* Right Sidebar Column */}
            <div className="flex flex-col gap-6">
                
                {/* Property Context Card */}
                <Card className="shadow-none border-border/50 bg-primary/[0.02]">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Property Context</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-5">
                        <div className="flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-card border border-border flex items-center justify-center shrink-0">
                                <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-bold text-foreground">{rentBill.tenancy?.unit?.property?.name || 'Assigned Property'}</p>
                                <p className="text-sm text-muted-foreground">Management Division</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-card border border-border flex items-center justify-center shrink-0">
                                <MapPin className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-bold text-foreground">Unit {rentBill.tenancy?.unit?.unit_name || 'N/A'}</p>
                                <p className="text-sm text-muted-foreground">Code: {rentBill.tenancy?.unit?.unit_code || '—'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Metadata Card */}
                <Card className="shadow-none border-border/50">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Invoice Metadata</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4 text-sm">
                        <div className="flex justify-between items-center py-2 border-b border-border/50 border-dashed">
                            <span className="text-muted-foreground">System ID</span>
                            <span className="font-mono font-medium">#{rentBill.id}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50 border-dashed">
                            <span className="text-muted-foreground">Created</span>
                            <span className="font-medium text-right">{formatDateTime(rentBill.created_at)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-muted-foreground">Last Verified</span>
                            <span className="font-medium text-right">{formatDateTime(rentBill.updated_at)}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Help Box */}
                <div className="p-5 bg-muted/40 rounded-2xl border flex gap-3 items-start">
                    <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Need assistance with this invoice? Contact your property manager via the <Link href="/tenant/messages" className="text-primary font-medium hover:underline">Message Center</Link> for clarifications on charges or payments.
                    </p>
                </div>

            </div>

        </div>

    </main>
  );
}


RentBillShow.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
