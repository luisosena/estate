import { LandlordSidebar } from '@/components/layout/landlord-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { route } from 'ziggy-js';

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
  payments: Payment[];
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
    <SidebarProvider defaultOpen={false}>
      <LandlordSidebar properties={[]} />
      <SidebarInset className="px-6 pt-4 pb-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <SidebarTrigger />
          <div className="flex-1">
            <Link
              href={route('landlord.utility-bills.index')}
              className="mb-4 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Utility Bills
            </Link>
            <h1 className="text-2xl font-bold text-gray-200">
              Utility Bill Details
            </h1>
            <p className="text-sm text-gray-400">
              {bill.tenancy_utility?.utility_type?.name} -{' '}
              {formatDate(bill.billing_month)}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Bill Details */}
          <Card>
            <CardHeader>
              <CardTitle>Bill Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400">Status</span>
                <Badge variant={getStatusVariant(bill.status)}>{bill.status}</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400">Billing Month</span>
                <span className="text-gray-200">{formatDate(bill.billing_month)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400">Due Date</span>
                <span className="text-gray-200">{formatDate(bill.due_date)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400">Amount Due</span>
                <span className="text-lg font-bold text-gray-200">
                  {formatCurrency(bill.amount_due)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400">Amount Paid</span>
                <span className="text-lg font-bold text-green-400">
                  {formatCurrency(bill.amount_paid)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">Outstanding</span>
                <span
                  className={`text-lg font-bold ${
                    outstandingAmount > 0 ? 'text-red-400' : 'text-green-400'
                  }`}
                >
                  {formatCurrency(outstandingAmount)}
                </span>
              </div>

              {/* Actions */}
              {bill.status !== 'paid' && bill.status !== 'waived' && (
                <div className="mt-4 pt-4 border-t border-gray-700">
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
              <div className="py-2 border-b border-gray-700">
                <p className="text-sm text-gray-400">Tenant</p>
                <p className="text-lg font-medium text-gray-200">
                  {bill.tenancy_utility?.tenancy?.tenant?.full_name || 'N/A'}
                </p>
              </div>
              <div className="py-2 border-b border-gray-700">
                <p className="text-sm text-gray-400">Property</p>
                <p className="text-gray-200">
                  {bill.tenancy_utility?.tenancy?.unit?.property?.name || 'N/A'}
                </p>
              </div>
              <div className="py-2 border-b border-gray-700">
                <p className="text-sm text-gray-400">Unit</p>
                <p className="text-gray-200">
                  {bill.tenancy_utility?.tenancy?.unit?.unit_name || 'N/A'}
                </p>
              </div>
              <div className="py-2">
                <p className="text-sm text-gray-400">Utility Type</p>
                <p className="text-gray-200">
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
            {bill.payments?.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-400">No payments recorded for this bill.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bill.payments?.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800/50 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          payment.status === 'completed'
                            ? 'bg-green-500/20'
                            : 'bg-gray-500/20'
                        }`}
                      >
                        <CheckCircle
                          className={`h-5 w-5 ${
                            payment.status === 'completed'
                              ? 'text-green-400'
                              : 'text-gray-400'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-200">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-sm text-gray-400">
                          {payment.payment_method} • {formatDate(payment.paid_at)}
                        </p>
                        {payment.reference_number && (
                          <p className="text-xs text-gray-500">
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
      </SidebarInset>
    </SidebarProvider>
  );
}
