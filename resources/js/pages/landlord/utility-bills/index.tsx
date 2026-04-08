import { Link } from '@inertiajs/react';
import { MoreHorizontal, Eye, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

import { LandlordSidebar } from '@/components/layout/landlord-sidebar';
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
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';


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
  };
  properties: Property[];
  filters: {
    status: string;
    property_id: string;
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
  properties,
  filters,
  summary,
}: Props) {
  return (
    <SidebarProvider defaultOpen={false}>
      <LandlordSidebar properties={[]} />
      <SidebarInset className="px-6 pt-4 pb-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-200">
              Utility Bills
            </h1>
            <p className="text-sm text-gray-400">
              View and manage all utility bills
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Pending Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                {formatCurrency(summary.total_pending)}
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">
                Overdue Amount
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
                Partial Payment
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
            <CardTitle>All Utility Bills</CardTitle>
          </CardHeader>
          <CardContent>
            {bills.data.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-400">No utility bills found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="pb-3 text-left text-sm font-medium text-gray-400">
                        Tenant
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-gray-400">
                        Property/Unit
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-gray-400">
                        Utility Type
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-gray-400">
                        Billing Month
                      </th>
                      <th className="pb-3 text-right text-sm font-medium text-gray-400">
                        Amount Due
                      </th>
                      <th className="pb-3 text-right text-sm font-medium text-gray-400">
                        Paid
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-gray-400">
                        Due Date
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-gray-400">
                        Status
                      </th>
                      <th className="pb-3 text-right text-sm font-medium text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.data.map((bill) => (
                      <tr
                        key={bill.id}
                        className="border-b border-gray-800 last:border-0"
                      >
                        <td className="py-4">
                          <p className="font-medium text-gray-200">
                            {bill.tenancy_utility?.tenancy?.tenant?.full_name || 'N/A'}
                          </p>
                        </td>
                        <td className="py-4">
                          <p className="text-gray-300">
                            {bill.tenancy_utility?.tenancy?.unit?.unit_name || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {bill.tenancy_utility?.tenancy?.unit?.property?.name || 'N/A'}
                          </p>
                        </td>
                        <td className="py-4">
                          <p className="text-gray-300">
                            {bill.tenancy_utility?.utility_type?.name || 'N/A'}
                          </p>
                        </td>
                        <td className="py-4">
                          <p className="text-gray-300">
                            {formatDate(bill.billing_month)}
                          </p>
                        </td>
                        <td className="py-4 text-right">
                          <p className="font-medium text-gray-200">
                            {formatCurrency(bill.amount_due)}
                          </p>
                        </td>
                        <td className="py-4 text-right">
                          <p className="text-gray-300">
                            {formatCurrency(bill.amount_paid)}
                          </p>
                        </td>
                        <td className="py-4">
                          <p
                            className={`text-sm ${
                              bill.status === 'overdue'
                                ? 'text-red-400'
                                : 'text-gray-300'
                            }`}
                          >
                            {formatDate(bill.due_date)}
                          </p>
                        </td>
                        <td className="py-4">
                          <Badge variant={getStatusVariant(bill.status)}>
                            {bill.status}
                          </Badge>
                        </td>
                        <td className="py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Link
                                href={route('landlord.utility-bills.show', {
                                  utilityBill: bill.id,
                                })}
                              >
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                              </Link>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {bills.last_page > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Showing {(bills.current_page - 1) * bills.per_page + 1} to{' '}
                  {Math.min(bills.current_page * bills.per_page, bills.total)} of{' '}
                  {bills.total} results
                </p>
                <div className="flex gap-2">
                  {bills.current_page > 1 && (
                    <Link
                      href={route('landlord.utility-bills.index', {
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
                      href={route('landlord.utility-bills.index', {
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
      </SidebarInset>
    </SidebarProvider>
  );
}
