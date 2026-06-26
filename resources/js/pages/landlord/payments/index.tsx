import { Link, router } from '@inertiajs/react';
import { MoreHorizontal, Eye } from 'lucide-react';
import React from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { ReceiptDownloadButton } from '@/components/payments/ReceiptDownloadButton';
import Pagination from '@/components/shared/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Unit {
  id: number;
  unit_name: string;
  unit_code: string;
  property?: {
    name: string;
  };
}

interface Tenant {
  id: number;
  full_name: string;
  tenant_code: string;
}

interface Tenancy {
  id: number;
  unit: Unit;
  tenant: Tenant;
}

interface RentBill {
  id: number;
  billing_month: string;
}

interface Payment {
  id: number;
  amount: number;
  payment_type: 'rent' | 'utility';
  payment_method: string;
  status: 'paid' | 'partial' | 'overdue' | 'pending' | 'cancelled';
  paid_at: string;
  created_at: string;
  tenancy: Tenancy;
  rent_bill: RentBill | null;
}

interface Stats {
  total_payments: number;
  total_amount: number;
  this_month_amount: number;
}

interface Props {
  payments: {
    data: Payment[];
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    meta: {
      current_page: number;
      last_page: number;
      total: number;
      per_page: number;
      links: Array<{
        url: string | null;
        label: string;
        active: boolean;
      }>;
    };
  };
  stats: Stats;
  filters: {
    search: string;
  };
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

const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'paid':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'partial':
      return 'outline';
    case 'overdue':
      return 'destructive';
    case 'cancelled':
      return 'outline';
    default:
      return 'outline';
  }
};

export default function PaymentsIndex({ payments, stats }: Props) {
  const { data: paymentList, meta } = payments;
  const links = meta.links;

  return (
    <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
          
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  Financial Records
                </Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Payments
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                View and manage all tenant payments across your portfolio
              </p>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_payments}</div>
              <p className="text-xs text-muted-foreground">
                All time collection count
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.total_amount)}
              </div>
              <p className="text-xs text-muted-foreground">
                Gross received life-to-date
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.this_month_amount)}
              </div>
              <p className="text-xs text-muted-foreground">
                Current month collection
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>Comprehensive list of all rent and utility payments</CardDescription>
                </div>
                <div className="px-3 py-1 bg-background rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-border/50">
                    {meta.total} Transactions
                </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="bg-muted/30">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-10 px-4 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Date
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Tenant
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Unit/Property
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Payment Details
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Method
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Status
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Receipt
                    </th>
                    <th className="h-10 px-4 text-right align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {paymentList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-12 text-center text-muted-foreground">
                        No payment records found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    paymentList.map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-b transition-colors hover:bg-muted/20"
                      >
                        <td className="p-4 align-middle whitespace-nowrap">
                          {formatDate(payment.paid_at)}
                        </td>
                        <td className="p-4 align-middle">
                          <div className="font-bold">
                            {payment.tenancy?.tenant?.full_name || 'N/A'}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {payment.tenancy?.tenant?.tenant_code || ''}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="text-sm">
                            <div className="font-medium">{payment.tenancy?.unit?.unit_name || 'N/A'}</div>
                            {payment.tenancy?.unit?.property?.name && (
                              <div className="text-muted-foreground text-[10px] font-medium flex items-center gap-1">
                                {payment.tenancy.unit.property.name}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 h-4 border-muted-foreground/20">
                            {payment.payment_type}
                          </Badge>
                          {payment.rent_bill && (
                            <div className="text-[10px] mt-1 text-muted-foreground font-medium">
                              Period: {payment.rent_bill.billing_month}
                            </div>
                          )}
                        </td>
                        <td className="p-4 align-middle font-black text-foreground">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="p-4 align-middle capitalize text-xs font-semibold">
                          {payment.payment_method}
                        </td>
                        <td className="p-4 align-middle">
                          <Badge variant={getStatusVariant(payment.status)} className="capitalize">
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle">
                          <ReceiptDownloadButton
                            paymentId={payment.id}
                            paymentStatus={payment.status}
                            size="sm"
                            variant="outline"
                          />
                        </td>
                        <td className="p-4 align-middle text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/5">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem asChild className="cursor-pointer">
                                <Link
                                  href={`/landlord/tenants/${payment.tenancy?.tenant?.tenant_code}`}
                                  className="flex items-center"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Profile
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
            <div className="p-4 border-t bg-muted/20">
                <Pagination links={links} />
            </div>
          </CardContent>
        </Card>
        </div>
    </main>
  );
}

PaymentsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
