import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, AlertCircle, CheckCircle2, Clock, XCircle, Receipt, Building, User, Home, DollarSign } from 'lucide-react';
import { useState } from 'react';
import React from 'react';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface Tenant {
  id: number;
  full_name: string;
  phone?: string;
  email?: string;
}

interface Tenancy {
  id: number;
  unit: Unit;
  tenant: Tenant;
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
  tenancy: Tenancy;
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
          <XCircle className="mr-1 h-3 w-3" />
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

export default function LandlordRentBillShow({ rentBill }: Props) {
  const { props } = usePage();
  const [showWaiveModal, setShowWaiveModal] = useState(false);
  const [waiveNotes, setWaiveNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get flash messages
  const successMessage = (props as any).success;
  const errorMessage = (props as any).error;

  const handleWaive = () => {
    setIsSubmitting(true);
    router.post(
      route('landlord.rent-bills.waive', rentBill.id),
      { notes: waiveNotes },
      {
        onFinish: () => {
          setIsSubmitting(false);
          setShowWaiveModal(false);
        },
      }
    );
  };

  const canWaive = rentBill.status !== 'waived' && rentBill.status !== 'paid';

  return (
        <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
          
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
                  <Receipt className="w-3 h-3" />
                  Bill Details
                </Badge>
                {getStatusBadge(rentBill.status)}
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                #{rentBill.id} - {formatDate(rentBill.billing_month)}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Amount Due: {formatCurrency(rentBill.amount_due)}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {canWaive && (
                <Button variant="outline" onClick={() => setShowWaiveModal(true)} className="bg-card border-border/50 shadow-sm">
                  <XCircle className="w-4 h-4 mr-2" />
                  Waive Bill
                </Button>
              )}
              <Link href={route('landlord.rent-bills.index')}>
                <Button variant="outline" className="bg-card border-border/50 shadow-sm hidden sm:flex">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-6">

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 rounded-md bg-green-100 p-4 text-green-800 dark:bg-green-900 dark:text-green-100">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 rounded-md bg-red-100 p-4 text-red-800 dark:bg-red-900 dark:text-red-100">
            {errorMessage}
          </div>
        )}

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

          {/* Right Column - Tenant & Property Info */}
          <div className="space-y-6">
            {/* Tenant Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Tenant Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Name</div>
                    <div className="font-medium">{rentBill.tenancy?.tenant?.full_name || 'N/A'}</div>
                  </div>
                  {rentBill.tenancy?.tenant?.phone && (
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div>{rentBill.tenancy.tenant.phone}</div>
                    </div>
                  )}
                  {rentBill.tenancy?.tenant?.email && (
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div>{rentBill.tenancy.tenant.email}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Property & Unit Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Property & Unit
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
                  <Building className="h-5 w-5" />
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

        {/* Waive Modal */}
        {showWaiveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
              <h2 className="mb-4 text-xl font-bold">Waive Rent Bill</h2>
              <p className="mb-4 text-muted-foreground">
                Are you sure you want to waive this rent bill? This action cannot be undone.
              </p>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">
                  Notes (optional)
                </label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  rows={3}
                  value={waiveNotes}
                  onChange={(e) => setWaiveNotes(e.target.value)}
                  placeholder="Reason for waiving this bill..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowWaiveModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleWaive}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Waive Bill'}
                </Button>
              </div>
            </div>
          </div>
        )}
          </div>
        </main>
  );
}

LandlordRentBillShow.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
