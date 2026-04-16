import { Link, usePage } from '@inertiajs/react';
import {
  CreditCard,
  Plus,
  CalendarDays,
  History,
  Info,
} from 'lucide-react';
import React, { useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate, getFormattedDate, getStatusVariant } from '@/lib/formatters';
import { type SharedData } from '@/types';

interface Tenant {
  id: number;
  full_name: string;
  phone?: string;
  email?: string;
}

interface Tenancy {
  id: number;
  monthly_rent: number;
}

interface Payment {
  id: number;
  amount: number;
  payment_type: string;
  payment_method: string;
  status?: string;
  paid_at: string | null;
  created_at: string;
}

interface Props {
  tenant: Tenant;
  tenancy?: Tenancy | null;
  payments?: Payment[];
  pendingAmount?: number;
}


export default function TenantPayments({
  tenant,
  tenancy,
  payments = [],
  pendingAmount = 0,
}: Props) {
  const { flash } = usePage<SharedData>().props;

  useEffect(() => {
    if (flash?.success) {
      toast.success(flash.success);
    }
    if (flash?.error) {
      toast.error(flash.error);
    }
  }, [flash]);

  return (
    <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
        <Toaster position="top-right" />
        
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
                    Payments
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Track your financial history and manage outstanding balances.
                </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <Button asChild className="shadow-sm">
                    <Link href={route('tenant.payments.make')}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Payment
                    </Link>
                </Button>
            </div>
        </header>

        {/* Actionable Status Banner */}
        {tenancy && pendingAmount > 0 ? (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-semibold mb-2">
                <Info className="w-4 h-4" />
                Pending Balance Detected
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-1">{formatCurrency(pendingAmount)}</h3>
              <p className="text-sm text-muted-foreground">
                Monthly Rent: <span className="font-medium text-foreground">{formatCurrency(tenancy.monthly_rent)}</span>
              </p>
            </div>
            <Button asChild size="lg" className="relative z-10 bg-amber-600 hover:bg-amber-700 text-white border-0 shadow-lg shadow-amber-600/20">
              <Link href={route('tenant.payments.make')}>
                Pay Balance Now
              </Link>
            </Button>
            <CreditCard className="absolute -bottom-6 -right-6 w-32 h-32 text-amber-200/50 dark:text-amber-900/10 pointer-events-none" />
          </div>
        ) : tenancy && pendingAmount === 0 ? (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
              <History className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-green-800 dark:text-green-400 text-lg">All Payments Settled</p>
              <p className="text-sm text-muted-foreground italic">You have no outstanding rent or utility balances at this time.</p>
            </div>
          </div>
        ) : !tenancy && (
          <Card className="shadow-none border-dashed border-2">
            <CardContent className="py-12 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Info className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No active tenancy</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  We couldn't find an active tenancy for your account. Please contact your property manager for assistance.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment History Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Payment Ledger</h2>
            <Badge variant="outline" className="font-normal text-muted-foreground">
              {payments.length} transactions recorded
            </Badge>
          </div>

          <Card className="shadow-none border-border/50">
            <CardContent className="p-0">
              {payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                    <History className="w-8 h-8 text-muted-foreground opacity-50" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">No payments found</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    You haven't made any payments yet. Once you do, they will appear here in your ledger.
                  </p>
                  <Button asChild variant="outline" className="mt-6">
                    <Link href={route('tenant.payments.make')}>Make your first payment</Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 gap-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 shrink-0 group-hover:bg-primary/10 transition-colors">
                          <CreditCard className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-lg">
                            {formatCurrency(payment.amount)}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="capitalize">{payment.payment_type}</span>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                            <span>{payment.payment_method.replace('_', ' ')}</span>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                            <span>{formatDate(payment.paid_at || payment.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-4 ml-12 sm:ml-0">
                        {payment.status && (
                          <Badge 
                            variant={getStatusVariant(payment.status)}
                            className="px-3 py-0.5 font-medium rounded-full shadow-none capitalize"
                          >
                            {payment.status}
                          </Badge>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex">
                           <Info className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

    </main>
  );
}


TenantPayments.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
