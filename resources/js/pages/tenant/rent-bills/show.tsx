import { Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, Receipt, Home, DollarSign } from 'lucide-react';
import { route } from 'ziggy-js';

import { TenantSidebar } from '@/components/layout/tenant-sidebar';
import TenantNotificationBell from '@/components/tenant-notification-bell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

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

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
  }).format(amount);

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'paid':
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Paid
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="secondary" className="bg-amber-500">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
    case 'partial':
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-500">
          <Clock className="mr-1 h-3 w-3" />
          Partial
        </Badge>
      );
    case 'overdue':
      return (
        <Badge variant="destructive">
          <AlertCircle className="mr-1 h-3 w-3" />
          Overdue
        </Badge>
      );
    case 'waived':
      return (
        <Badge variant="outline" className="text-gray-500">
          Waived
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPaymentStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge variant="default" className="bg-green-500">Completed</Badge>;
    case 'pending':
      return <Badge variant="secondary" className="bg-amber-500">Pending</Badge>;
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>;
    case 'cancelled':
      return <Badge variant="outline">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function Show({ rentBill }: Props) {
  const handleLogout = () => {
    router.post('/logout');
  };

  const canPay = rentBill.status !== 'paid' && rentBill.status !== 'waived';

  return (
    <SidebarProvider defaultOpen={false}>
      <TenantSidebar />
      <SidebarInset className="px-6 pt-4 pb-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Rent Bill Details</h1>
            <p className="text-sm text-muted-foreground">
              Billing Month: {formatDate(rentBill.billing_month)}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Back Button */}
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={route('tenant.rent-bills.index')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Rent Bills
            </Link>
          </Button>
        </div>

        {/* Status Banner */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Rent Bill</h1>
            {getStatusBadge(rentBill.status)}
          </div>
          {canPay && (
            <Button asChild>
              <Link href={route('tenant.payments.make')}>
                <DollarSign className="mr-2 h-4 w-4" />
                Make Payment
              </Link>
            </Button>
          )}
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Bill Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bill Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Bill Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-sm text-muted-foreground">Amount Due</div>
                    <div className="text-xl font-bold">{formatCurrency(rentBill.amount_due)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Amount Paid</div>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(rentBill.amount_paid)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Outstanding</div>
                    <div className="text-xl font-bold text-amber-600">
                      {formatCurrency(rentBill.outstanding_amount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Due Date</div>
                    <div className="text-xl font-medium">{formatDate(rentBill.due_date)}</div>
                  </div>
                </div>

                {rentBill.notes && (
                  <div className="mt-4 border-t pt-4">
                    <div className="text-sm text-muted-foreground">Notes</div>
                    <div className="mt-1">{rentBill.notes}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rentBill.payments && rentBill.payments.length > 0 ? (
                  <div className="space-y-4">
                    {rentBill.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <div className="font-medium">{formatCurrency(payment.amount)}</div>
                          <div className="text-sm text-muted-foreground">
                            {payment.payment_method} • {formatDateTime(payment.paid_at)}
                          </div>
                          {payment.reference_number && (
                            <div className="text-xs text-muted-foreground">
                              Ref: {payment.reference_number}
                            </div>
                          )}
                        </div>
                        {getPaymentStatusBadge(payment.status)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No payments recorded for this bill
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Property Info */}
          <div className="space-y-6">
            {/* Property & Unit Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Your Property
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Property</div>
                    <div className="font-medium">
                      {rentBill.tenancy?.unit?.property?.name || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Unit</div>
                    <div className="font-medium">
                      {rentBill.tenancy?.unit?.unit_name || 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {rentBill.tenancy?.unit?.unit_code || ''}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bill Meta */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Bill Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Bill ID</div>
                    <div className="font-medium">#{rentBill.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Created</div>
                    <div>{formatDateTime(rentBill.created_at)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Last Updated</div>
                    <div>{formatDateTime(rentBill.updated_at)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
