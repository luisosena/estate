import { TenantSidebar } from '@/components/layout/tenant-sidebar';
import TenantNotificationBell from '@/components/tenant-notification-bell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Link, router } from '@inertiajs/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, CheckCircle2, Clock, AlertCircle, Receipt } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState } from 'react';

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

const formatDate = (dateString: string | null) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
  }).format(amount);

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

export default function Index({ rentBills, currentMonthBill, stats }: Props) {
  const handleLogout = () => {
    router.post('/logout');
  };



  return (
    <SidebarProvider defaultOpen={false}>
      <TenantSidebar />
      <SidebarInset className="px-6 pt-4 pb-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Rent Bills</h1>
            <p className="text-sm text-muted-foreground">
              View and manage your rent payments
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Current Month Bill Card */}
        {currentMonthBill && (
          <Card className="mb-8 border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>This Month's Rent</span>
                {getStatusBadge(currentMonthBill.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <div className="text-sm text-muted-foreground">Amount Due</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(currentMonthBill.amount_due)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Amount Paid</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(currentMonthBill.amount_paid)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Due Date</div>
                  <div className="text-2xl font-medium">
                    {formatDate(currentMonthBill.due_date)}
                  </div>
                </div>
              </div>
              {currentMonthBill.outstanding_amount > 0 && (
                <div className="mt-4 flex items-center justify-between rounded-lg bg-amber-50 p-4 dark:bg-amber-950">
                  <div>
                    <div className="text-sm text-muted-foreground">Outstanding Amount</div>
                    <div className="text-xl font-bold text-amber-600">
                      {formatCurrency(currentMonthBill.outstanding_amount)}
                    </div>
                  </div>
                  <Button asChild>
                    <Link href={route('tenant.payments.make')}>
                      Pay Now
                    </Link>
                  </Button>
                </div>
              )}
              {currentMonthBill.status === 'paid' && (
                <div className="mt-4 flex items-center justify-between rounded-lg bg-green-50 p-4 dark:bg-green-950">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-600">
                      Your rent is paid for this month!
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.paid}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bills Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Billing Month
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Amount Due
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Amount Paid
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Outstanding
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Due Date
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {rentBills.data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        <Receipt className="mx-auto mb-2 h-8 w-8 opacity-50" />
                        <p>No rent bills found</p>
                      </td>
                    </tr>
                  ) : (
                    rentBills.data.map((bill) => (
                      <tr
                        key={bill.id}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <td className="p-4 align-middle">
                          {formatDate(bill.billing_month)}
                        </td>
                        <td className="p-4 align-middle">
                          {formatCurrency(bill.amount_due)}
                        </td>
                        <td className="p-4 align-middle">
                          {formatCurrency(bill.amount_paid)}
                        </td>
                        <td className="p-4 align-middle">
                          <span
                            className={
                              bill.outstanding_amount > 0
                                ? 'font-medium text-amber-600'
                                : 'text-green-600'
                            }
                          >
                            {formatCurrency(bill.outstanding_amount)}
                          </span>
                        </td>
                        <td className="p-4 align-middle">
                          {formatDate(bill.due_date)}
                        </td>
                        <td className="p-4 align-middle">
                          {getStatusBadge(bill.status)}
                        </td>
                        <td className="p-4 align-middle text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link
                                  href={route('tenant.rent-bills.show', bill.id)}
                                  className="flex items-center"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {rentBills.last_page > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {(rentBills.current_page - 1) * rentBills.per_page + 1} to{' '}
                  {Math.min(rentBills.current_page * rentBills.per_page, rentBills.total)} of{' '}
                  {rentBills.total} results
                </div>
                <div className="flex gap-1">
                  {rentBills.links.map((link, index) => (
                    <Button
                      key={index}
                      variant={link.active ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => link.url && (window.location.href = link.url)}
                      disabled={!link.url}
                    >
                      {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </SidebarInset>
    </SidebarProvider>
  );
}
