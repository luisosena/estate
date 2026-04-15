import { Link } from '@inertiajs/react';
import { MoreHorizontal, Eye, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

import React from 'react';
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
}

interface Tenant {
  id: number;
  full_name: string;
}

interface Tenancy {
  id: number;
  unit: Unit;
  tenant: Tenant;
}

interface RentBill {
  id: number;
  billing_month: string;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  status: 'pending' | 'paid' | 'partial' | 'overdue' | 'waived';
  outstanding_amount: number;
  tenancy: Tenancy;
}

interface Stats {
  total: number;
  pending: number;
  overdue: number;
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
          <XCircle className="mr-1 h-3 w-3" />
          Waived
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function Index({ rentBills, stats }: Props) {
  const [currentPage, setCurrentPage] = useState(rentBills.current_page);

  const handlePageChange = (pageUrl: string | null) => {
    if (pageUrl) {
      window.location.href = pageUrl;
    }
  };

  return (
        <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
          
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Invoicing
                </Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Rent Bills
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and view all rent bills across your properties
              </p>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-6">
        <div className="mb-8 grid gap-4 md:grid-cols-4">
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
              <div className="text-2xl font-bold text-amber-600">
                {stats.pending}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.overdue}
              </div>
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
            <CardTitle>All Rent Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Tenant
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Unit / Property
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Billing Month
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Amount Due
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Paid
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
                      <td colSpan={9} className="p-8 text-center text-muted-foreground">
                        No rent bills found
                      </td>
                    </tr>
                  ) : (
                    rentBills.data.map((bill) => (
                      <tr
                        key={bill.id}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <td className="p-4 align-middle">
                          <div className="font-medium">{bill.tenancy?.tenant?.full_name || 'N/A'}</div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="text-sm">
                            <div>{bill.tenancy?.unit?.unit_name || 'N/A'}</div>
                            <div className="text-muted-foreground text-xs">
                              {bill.tenancy?.unit?.unit_code || ''}
                            </div>
                          </div>
                        </td>
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
                                  href={route('landlord.rent-bills.show', bill.id)}
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

Index.layout = (page: React.ReactNode) => <LandlordLayout>{page}</LandlordLayout>;
