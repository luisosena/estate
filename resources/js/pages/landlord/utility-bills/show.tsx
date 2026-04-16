import { Link } from '@inertiajs/react';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
interface UtilityType {
  id: number;
  name: string;
}

interface TenancyUtility {
  id: number;
  amount: number;
  billing_cycle: string;
  utility_type: UtilityType;
  tenancy: {
    id: number;
    unit: {
      id: number;
      unit_name: string;
      property: {
        id: number;
        name: string;
      };
    };
    tenant: {
      id: number;
      full_name: string;
    };
  };
}

interface Unit {
  id: number;
  unit_name: string;
}

interface Property {
  id: number;
  name: string;
}

interface UnitWithProperty extends Unit {
  property: Property;
}

interface Tenant {
  id: number;
  full_name: string;
}

interface Tenancy {
  id: number;
  unit: UnitWithProperty;
  tenant: Tenant;
}

interface Payment {
  id: number;
  amount: number;
  payment_method: string;
  status: string;
  paid_at: string | null;
  reference_number: string | null;
}

interface UtilityBill {
  id: number;
  billing_month: string;
  units_consumed: number | null;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  status: string;
  notes: string | null;
  tenancy_utility: TenancyUtility;
  payments: {
    data: Payment[];
  };
}

interface Props {
  bill: UtilityBill;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
  }).format(amount);

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getStatusVariant = (
  status?: string,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status?.toLowerCase()) {
    case 'paid':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'overdue':
      return 'destructive';
    case 'partial':
      return 'outline';
    case 'waived':
      return 'outline';
    default:
      return 'outline';
  }
};

export default function LandlordUtilityBillShow({ bill }: Props) {
  const outstandingAmount = bill.amount_due - bill.amount_paid;

  return (
        <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
          
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  Bill Details
                </Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                {bill.tenancy_utility?.utility_type?.name} Bill
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Billing Month: {formatDate(bill.billing_month)}
              </p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Link href={route('landlord.utility-bills.index')}>
                <Button variant="outline" className="bg-card border-border/50 shadow-sm hidden sm:flex">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Bills
                </Button>
              </Link>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-6">

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Bill Details */}
          <Card>
            <CardHeader>
              <CardTitle>Bill Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={getStatusVariant(bill.status)}>{bill.status}</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Billing Month</span>
                <span className="text-foreground">{formatDate(bill.billing_month)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Due Date</span>
                <span className="text-foreground">{formatDate(bill.due_date)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Amount Due</span>
                <span className="text-lg font-bold text-foreground">
                  {formatCurrency(bill.amount_due)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(bill.amount_paid)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Outstanding</span>
                <span
                  className={`text-lg font-bold ${
                    outstandingAmount > 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {formatCurrency(outstandingAmount)}
                </span>
              </div>

              {/* Actions */}
              {bill.status !== 'paid' && bill.status !== 'waived' && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <Link
                    href={route('landlord.utility-bills.waive', { utilityBill: bill.id })}
                    method="post"
                  >
                    <Button variant="outline" className="w-full">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Waive This Bill
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tenant & Property Info */}
          <Card>
            <CardHeader>
              <CardTitle>Tenant & Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="py-2 border-b border-border/50">
                <p className="text-sm text-muted-foreground">Tenant</p>
                <p className="text-lg font-medium text-foreground">
                  {bill.tenancy_utility?.tenancy?.tenant?.full_name || 'N/A'}
                </p>
              </div>
              <div className="py-2 border-b border-border/50">
                <p className="text-sm text-muted-foreground">Property</p>
                <p className="text-foreground">
                  {bill.tenancy_utility?.tenancy?.unit?.property?.name || 'N/A'}
                </p>
              </div>
              <div className="py-2 border-b border-border/50">
                <p className="text-sm text-muted-foreground">Unit</p>
                <p className="text-foreground">
                  {bill.tenancy_utility?.tenancy?.unit?.unit_name || 'N/A'}
                </p>
              </div>
              <div className="py-2">
                <p className="text-sm text-muted-foreground">Utility Type</p>
                <p className="text-foreground">
                  {bill.tenancy_utility?.utility_type?.name || 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment History */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {(bill.payments?.data || []).length === 0 ? (
              <div className="py-8 text-center border overflow-hidden rounded-md border-dashed border-border/60 bg-card">
                <p className="text-muted-foreground">No payments recorded for this bill.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bill.payments.data.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          payment.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-muted text-muted-foreground border border-border/50'
                        }`}
                      >
                        <CheckCircle
                          className={`h-5 w-5`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {payment.payment_method} • {formatDate(payment.paid_at)}
                        </p>
                        {payment.reference_number && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Ref: {payment.reference_number}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(payment.status)}>
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
          </div>
        </main>
  );
}

LandlordUtilityBillShow.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
