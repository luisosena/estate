import { Link, router } from '@inertiajs/react';
import { MoreHorizontal, Eye } from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
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
    status: string;
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
    case 'waived':
      return 'outline';
    default:
      return 'outline';
  }
};

export default function LandlordRentBillsIndex({ rentBills, stats }: Props) {
  const { data: billList, meta } = rentBills;
  const links = meta.links;

  return (
    <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
          
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-destructive" />
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
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-border/50 shadow-none bg-muted/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Issued</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black">{stats.total}</div>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-none bg-warning/5 border-warning/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-warning">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-warning">
                    {stats.pending}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-none bg-destructive/5 border-destructive/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-destructive">Overdue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-destructive">
                    {stats.overdue}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-none bg-success/5 border-success/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-success">Settled</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-success">
                    {stats.paid}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bills Table */}
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-muted/20">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Billing Ledger</CardTitle>
                        <CardDescription>Detailed record of rent obligations and status</CardDescription>
                    </div>
                    <div className="px-3 py-1 bg-background rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-border/50">
                        {meta.total} Bills
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="bg-muted/30">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-10 px-4 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                          Tenant
                        </th>
                        <th className="h-10 px-4 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                          Unit / Property
                        </th>
                        <th className="h-10 px-4 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                          Applied Period
                        </th>
                        <th className="h-10 px-4 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                          Amount Due
                        </th>
                        <th className="h-10 px-4 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                          Settled
                        </th>
                        <th className="h-10 px-4 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                          Balance
                        </th>
                        <th className="h-10 px-4 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                          Deadline
                        </th>
                        <th className="h-10 px-4 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                          Status
                        </th>
                        <th className="h-10 px-4 text-right align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0 text-xs">
                      {billList.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-12 text-center text-muted-foreground">
                            No rent bills found in the current selection.
                          </td>
                        </tr>
                      ) : (
                        billList.map((bill) => (
                          <tr
                            key={bill.id}
                            className="border-b transition-colors hover:bg-muted/20"
                          >
                            <td className="p-4 align-middle">
                              <div className="font-bold">{bill.tenancy?.tenant?.full_name || 'N/A'}</div>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="font-medium">{bill.tenancy?.unit?.unit_name || 'N/A'}</div>
                              {bill.tenancy?.unit?.property?.name && (
                                <div className="text-[10px] text-muted-foreground">
                                  {bill.tenancy.unit.property.name}
                                </div>
                              )}
                            </td>
                            <td className="p-4 align-middle font-medium">
                              {formatDate(bill.billing_month)}
                            </td>
                            <td className="p-4 align-middle font-bold">
                              {formatCurrency(bill.amount_due)}
                            </td>
                            <td className="p-4 align-middle">
                              {formatCurrency(bill.amount_paid)}
                            </td>
                            <td className="p-4 align-middle">
                                <span
                                className={
                                  bill.outstanding_amount > 0
                                    ? 'font-black text-warning'
                                    : 'font-black text-success'
                                }
                              >
                                {formatCurrency(bill.outstanding_amount)}
                              </span>
                            </td>
                            <td className="p-4 align-middle whitespace-nowrap">
                              {formatDate(bill.due_date)}
                            </td>
                            <td className="p-4 align-middle">
                              <Badge variant={getStatusVariant(bill.status)} className="capitalize">
                                {bill.status}
                              </Badge>
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
                                      href={route('landlord.rent-bills.show', bill.id)}
                                      className="flex items-center"
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      Bill Details
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

LandlordRentBillsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
