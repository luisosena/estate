import { Link, router } from '@inertiajs/react';
import { MoreHorizontal, Eye, Zap, AlertCircle, Clock } from 'lucide-react';
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
  outstanding_amount: number;
}

interface Props {
  bills: {
    data: UtilityBill[];
    meta: {
      current_page: number;
      total: number;
      links: Array<{
        url: string | null;
        label: string;
        active: boolean;
      }>;
    };
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

const formatDate = (dateString: string | null) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status.toLowerCase()) {
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
  const { data: billList, meta } = bills;
  const links = meta.links || [];

  return (
        <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
          
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-chart-4" />
                  Service Billing
                </Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Utility Bills
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor and manage consumption-based invoices
              </p>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-border/50 shadow-none bg-warning/5 border-warning/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-warning">Pending Receivables</CardTitle>
                  <Clock className="h-4 w-4 text-warning/50" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-warning">
                    {formatCurrency(summary.total_pending)}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-none bg-destructive/5 border-destructive/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-destructive">Overdue Collected</CardTitle>
                  <AlertCircle className="h-4 w-4 text-destructive/50" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-destructive">
                    {formatCurrency(summary.total_overdue)}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-none bg-chart-4/5 border-chart-4/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-chart-4">Partial Settlements</CardTitle>
                  <Zap className="h-4 w-4 text-chart-4/50" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-chart-4">
                    {formatCurrency(summary.total_partial)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bills Table */}
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-muted/20">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold">Utility Ledger</CardTitle>
                        <CardDescription>Comprehensive history of utility consumption and billing status</CardDescription>
                    </div>
                    <div className="px-3 py-1 bg-background rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-border/50">
                        {meta.total} Records
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative w-full overflow-auto">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow className="border-b transition-colors hover:bg-muted/50">
                          <TableHead className="h-10 px-4 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">Tenant</TableHead>
                          <TableHead className="h-10 px-4 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">Property/Unit</TableHead>
                          <TableHead className="h-10 px-4 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">Service</TableHead>
                          <TableHead className="h-10 px-4 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">Applied Month</TableHead>
                          <TableHead className="h-10 px-4 text-right align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">Requested</TableHead>
                          <TableHead className="h-10 px-4 text-right align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">Settled</TableHead>
                          <TableHead className="h-10 px-4 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">Deadline</TableHead>
                          <TableHead className="h-10 px-4 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</TableHead>
                          <TableHead className="h-10 px-4 text-right align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="text-xs [&_tr:last-child]:border-0">
                        {billList.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="p-12 text-center text-muted-foreground">
                              No utility records found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          billList.map((bill) => (
                            <TableRow key={bill.id} className="border-b transition-colors hover:bg-muted/20">
                              <TableCell className="p-4 align-middle">
                                <div className="font-bold text-foreground">
                                  {bill.tenancy_utility?.tenancy?.tenant?.full_name || 'N/A'}
                                </div>
                              </TableCell>
                              <TableCell className="p-4 align-middle">
                                <div className="font-medium text-foreground">
                                  {bill.tenancy_utility?.tenancy?.unit?.unit_name || 'N/A'}
                                </div>
                                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                                  {bill.tenancy_utility?.tenancy?.unit?.property?.name || 'N/A'}
                                </div>
                              </TableCell>
                              <TableCell className="p-4 align-middle font-semibold text-primary">
                                {bill.tenancy_utility?.utility_type?.name || 'N/A'}
                              </TableCell>
                              <TableCell className="p-4 align-middle font-medium">
                                {formatDate(bill.billing_month)}
                              </TableCell>
                              <TableCell className="p-4 align-middle text-right font-bold text-foreground">
                                {formatCurrency(bill.amount_due)}
                              </TableCell>
                              <TableCell className="p-4 align-middle text-right text-success font-semibold">
                                {formatCurrency(bill.amount_paid)}
                              </TableCell>
                              <TableCell className="p-4 align-middle whitespace-nowrap">
                                <span className={bill.status === 'overdue' ? 'text-destructive font-black' : 'font-medium'}>
                                  {formatDate(bill.due_date)}
                                </span>
                              </TableCell>
                              <TableCell className="p-4 align-middle">
                                <Badge variant={getStatusVariant(bill.status)} className="capitalize">
                                  {bill.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="p-4 align-middle text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/5 rounded-full">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem asChild className="cursor-pointer">
                                      <Link
                                        href={route('landlord.utility-bills.show', {
                                          utilityBill: bill.id,
                                        })}
                                        className="flex items-center"
                                      >
                                        <Eye className="mr-2 h-4 w-4" />
                                        Invoice Details
                                      </Link>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
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

LandlordUtilityBillsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
