import { Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { MoreHorizontal, Eye } from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
interface Property {
  id: number;
  name: string;
}

interface UtilityType {
  id: number;
  name: string;
}

interface Unit {
  id: number;
  unit_name: string;
  property?: Property;
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

interface TenancyUtility {
  id: number;
  utility_type: UtilityType;
  tenancy: Tenancy;
}

interface UtilityBill {
  id: number;
  billing_month: string;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  status: string;
  tenancy_utility: TenancyUtility;
}

interface Props {
  bills: {
    data: UtilityBill[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links?: { url: string | null; label: string; active: boolean }[];
  };

  summary: {
    total_pending: number;
    total_overdue: number;
    total_partial: number;
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

export default function LandlordUtilityBillsIndex({
  bills,
  summary,
}: Props) {
  return (
        <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
          
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  Invoicing
                </Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Utility Bills
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                View and manage all utility bills
              </p>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-6">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {formatCurrency(summary.total_pending)}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overdue Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.total_overdue)}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Partial Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary.total_partial)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bills Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Utility Bills</CardTitle>
          </CardHeader>
          <CardContent>
            {bills.data.length === 0 ? (
              <div className="py-8 text-center border overflow-hidden rounded-md border-border/50 bg-muted/10">
                <p className="text-muted-foreground">No utility bills found.</p>
              </div>
            ) : (
              <div className="relative w-full overflow-auto rounded-md border border-border/50 bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <TableHead>Tenant</TableHead>
                      <TableHead>Property/Unit</TableHead>
                      <TableHead>Utility Type</TableHead>
                      <TableHead>Billing Month</TableHead>
                      <TableHead className="text-right">Amount Due</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.data.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell>
                          <p className="font-medium text-foreground">
                            {bill.tenancy_utility?.tenancy?.tenant?.full_name || 'N/A'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-foreground">
                            {bill.tenancy_utility?.tenancy?.unit?.unit_name || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {bill.tenancy_utility?.tenancy?.unit?.property?.name || 'N/A'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-foreground">
                            {bill.tenancy_utility?.utility_type?.name || 'N/A'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-foreground">
                            {formatDate(bill.billing_month)}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="font-medium text-foreground">
                            {formatCurrency(bill.amount_due)}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="text-muted-foreground">
                            {formatCurrency(bill.amount_paid)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p
                            className={`text-sm ${
                              bill.status === 'overdue'
                                ? 'text-red-500 font-medium'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {formatDate(bill.due_date)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(bill.status)}>
                            {bill.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link
                                  href={route('landlord.utility-bills.show', {
                                    utilityBill: bill.id,
                                  })}
                                  className="flex items-center cursor-pointer"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {bills.last_page > 1 && bills.links && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(bills.current_page - 1) * bills.per_page + 1} to{' '}
                  {Math.min(bills.current_page * bills.per_page, bills.total)} of{' '}
                  {bills.total} results
                </p>
                <div className="flex gap-1">
                  {bills.links.map((link, index) => (
                    <Button
                      key={index}
                      variant={link.active ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        if (link.url) router.visit(link.url);
                      }}
                      disabled={!link.url}
                    >
                      <span dangerouslySetInnerHTML={{ __html: link.label.replace('&laquo;', '«').replace('&raquo;', '»') }} />
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

LandlordUtilityBillsIndex.layout = (page: React.ReactNode) => <LandlordLayout>{page}</LandlordLayout>;
