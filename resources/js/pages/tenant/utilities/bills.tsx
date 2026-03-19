import { TenantSidebar } from '@/components/layout/tenant-sidebar';
import TenantNotificationBell from '@/components/tenant-notification-bell';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { route } from 'ziggy-js';

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

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
  }).format(amount);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
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

export default function TenantUtilityBills({
  tenant,
  tenancy,
  bills,
  summary,
  filters,
}: Props) {
  return (
    <SidebarProvider defaultOpen={false}>
      <TenantSidebar />
      <SidebarInset className="px-6 pt-4 pb-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <SidebarTrigger />
          <div className="flex-1">
            <Link
              href={route('tenant.utilities')}
              className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to Utilities
            </Link>
            <h1 className="text-2xl font-bold">Utility Bills</h1>
            <p className="text-sm text-muted-foreground">
              View and pay your utility bills
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TenantNotificationBell initialUnreadCount={0} />
          </div>
        </div>

        {/* No Tenancy */}
        {!tenancy && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No active tenancy found. Please contact your landlord.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        {tenancy && (
          <>
            <div className="mb-6 grid gap-4 md:grid-cols-4">
              <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    Total Outstanding
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                    {formatCurrency(summary.total_outstanding)}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                    Pending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                    {formatCurrency(summary.total_pending)}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">
                    Overdue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                    {formatCurrency(summary.total_overdue)}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    Partial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {formatCurrency(summary.total_partial)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bills Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Bills</CardTitle>
              </CardHeader>
              <CardContent>
                {bills.data.length === 0 ? (
                  <div className="py-8 text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                    <p className="mt-4 text-lg font-medium">All Clear!</p>
                    <p className="text-muted-foreground">
                      You have no pending utility bills.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                            Period
                          </th>
                          <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                            Utility
                          </th>
                          <th className="pb-3 text-right text-sm font-medium text-muted-foreground">
                            Amount Due
                          </th>
                          <th className="pb-3 text-right text-sm font-medium text-muted-foreground">
                            Paid
                          </th>
                          <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                            Due Date
                          </th>
                          <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {bills.data.map((bill) => {
                          const outstanding = bill.amount_due - bill.amount_paid;
                          const isOverdue =
                            bill.status === 'overdue' ||
                            (bill.status === 'pending' &&
                              new Date(bill.due_date) < new Date());

                          return (
                            <tr key={bill.id} className="border-b last:border-0">
                              <td className="py-4">
                                <p className="font-medium">
                                  {formatDate(bill.billing_month)}
                                </p>
                              </td>
                              <td className="py-4">
                                <p className="text-muted-foreground">
                                  {bill.tenancy_utility?.utility_type?.name || 'N/A'}
                                </p>
                              </td>
                              <td className="py-4 text-right">
                                <p className="font-medium">
                                  {formatCurrency(bill.amount_due)}
                                </p>
                              </td>
                              <td className="py-4 text-right">
                                <p className="text-muted-foreground">
                                  {formatCurrency(bill.amount_paid)}
                                </p>
                              </td>
                              <td className="py-4">
                                <p
                                  className={`text-sm ${
                                    isOverdue ? 'text-red-500' : ''
                                  }`}
                                >
                                  {formatDate(bill.due_date)}
                                  {isOverdue && (
                                    <AlertCircle className="ml-1 inline h-3 w-3" />
                                  )}
                                </p>
                              </td>
                              <td className="py-4">
                                <Badge variant={getStatusVariant(bill.status)}>
                                  {bill.status}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {bills.last_page > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {(bills.current_page - 1) * bills.per_page + 1} to{' '}
                      {Math.min(bills.current_page * bills.per_page, bills.total)} of{' '}
                      {bills.total} results
                    </p>
                    <div className="flex gap-2">
                      {bills.current_page > 1 && (
                        <Link
                          href={route('tenant.utilities.bills', {
                            page: bills.current_page - 1,
                          })}
                        >
                          <Button variant="outline" size="sm">
                            Previous
                          </Button>
                        </Link>
                      )}
                      {bills.current_page < bills.last_page && (
                        <Link
                          href={route('tenant.utilities.bills', {
                            page: bills.current_page + 1,
                          })}
                        >
                          <Button variant="outline" size="sm">
                            Next
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
