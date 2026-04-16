import React from 'react';
import { Link, router } from '@inertiajs/react';
import { MoreHorizontal, Eye, ArrowLeft, CheckCircle2, Clock, CreditCard } from 'lucide-react';
import { useState } from 'react';

import LandlordLayout from '@/components/layout/LandlordLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';



interface Property {
  id: number;
  name: string;
}

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
          <Clock className="mr-1 h-3 w-3" />
          Overdue
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant="outline" className="text-gray-500">
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function PaymentsIndex({ payments, stats }: Props) {
  const [currentPage, setCurrentPage] = useState(payments.current_page);

  const handlePageChange = (pageUrl: string | null) => {
    if (pageUrl) {
      router.visit(pageUrl);
    }
  };

  return (
    <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
          
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Financial Records
                </Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Payments
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                View and manage all tenant payments
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
                All time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.total_amount)}
              </div>
              <p className="text-xs text-muted-foreground">
                All time
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
        <Card>
          <CardHeader>
            <CardTitle>All Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Tenant
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Unit
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Type
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Method
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
                  {payments.data.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground">
                        No payments found
                      </td>
                    </tr>
                  ) : (
                    payments.data.map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <td className="p-4 align-middle">
                          {formatDate(payment.paid_at)}
                        </td>
                        <td className="p-4 align-middle">
                          <div className="font-medium">
                            {payment.tenancy?.tenant?.full_name || 'N/A'}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="text-sm">
                            <div>{payment.tenancy?.unit?.unit_name || 'N/A'}</div>
                            <div className="text-muted-foreground text-xs">
                              {payment.tenancy?.unit?.unit_code || ''}
                            </div>
                            {payment.tenancy?.unit?.property?.name && (
                              <div className="text-muted-foreground text-xs">
                                {payment.tenancy.unit.property.name}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <span className="capitalize">{payment.payment_type}</span>
                          {payment.rent_bill && (
                            <div className="text-xs text-muted-foreground">
                              Bill: {payment.rent_bill.billing_month}
                            </div>
                          )}
                        </td>
                        <td className="p-4 align-middle">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="p-4 align-middle capitalize">
                          {payment.payment_method}
                        </td>
                        <td className="p-4 align-middle">
                          {getStatusBadge(payment.status)}
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
                                  href={`/landlord/tenants/${payment.tenancy?.tenant?.tenant_code}`}
                                  className="flex items-center"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Tenant
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
            {payments.last_page > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {(payments.current_page - 1) * payments.per_page + 1} to{' '}
                  {Math.min(payments.current_page * payments.per_page, payments.total)} of{' '}
                  {payments.total} results
                </div>
                <div className="flex gap-1">
                  {payments.links.map((link, index) => (
                    <Button
                      key={index}
                      variant={link.active ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handlePageChange(link.url)}
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
        </div>
    </main>
  );
}

PaymentsIndex.layout = (page: React.ReactNode) => <LandlordLayout>{page}</LandlordLayout>;
