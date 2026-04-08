import { Link, usePage } from '@inertiajs/react';
import {
  CreditCard,
  Plus,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { route } from 'ziggy-js';

import { TenantSidebar } from '@/components/layout/tenant-sidebar';
import TenantNotificationBell from '@/components/tenant-notification-bell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';


interface Tenant {
  id: number;
  full_name: string;
  phone?: string;
  email?: string;
}

interface Tenancy {
  id: number;
  monthly_rent: number;
}

interface Payment {
  id: number;
  amount: number;
  payment_type: string;
  payment_method: string;
  status?: string;
  paid_at: string | null;
  created_at: string;
}

interface Props {
  tenant: Tenant;
  tenancy?: Tenancy | null;
  payments?: Payment[];
  pendingAmount?: number;
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
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const getStatusVariant = (
  status?: string,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status?.toLowerCase()) {
    case 'paid':
      return 'default';
    case 'partial':
      return 'secondary';
    case 'overdue':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function TenantPayments({
  tenant,
  tenancy,
  payments = [],
  pendingAmount = 0,
}: Props) {
  const { props } = usePage();
  const success = (props as any).flash?.success;
  const error = (props as any).flash?.error;

  // Display flash messages as toasts
  useEffect(() => {
    if (success) {
      toast.success(success);
    }
    if (error) {
      toast.error(error);
    }
  }, [success, error]);

  return (
    <SidebarProvider defaultOpen={false}>
      <TenantSidebar />
      <Toaster />
      <SidebarInset className="px-6 pt-4 pb-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Payments</h1>
            <p className="text-sm text-muted-foreground">
              Manage your rent and utility payments
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TenantNotificationBell initialUnreadCount={0} />
          </div>
        </div>

        {/* Pending Payment Card */}
        {tenancy && pendingAmount > 0 && (
          <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-amber-600" />
                Pending Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(pendingAmount)}</p>
                  <p className="text-sm text-muted-foreground">
                    Monthly Rent: {formatCurrency(tenancy.monthly_rent)}
                  </p>
                </div>
                <Link href={route('tenant.payments.make')}>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Make Payment
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Settled Card */}
        {tenancy && pendingAmount === 0 && (
          <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
            <CardContent className="py-6">
              <div className="flex items-center justify-center gap-3">
                <CreditCard className="h-6 w-6 text-green-600" />
                <div className="text-center">
                  <p className="font-medium text-green-700 dark:text-green-400">
                    All Payments Settled
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You have no pending payments
                  </p>
                </div>
                <Link href={route('tenant.payments.make')}>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Payment
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Tenancy */}
        {!tenancy && (
          <Card className="mb-6">
            <CardContent className="py-6">
              <div className="text-center">
                <p className="text-muted-foreground">
                  No active tenancy found. Please contact your landlord.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                No payment history yet
              </p>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-muted rounded-lg px-3 py-2 text-center text-xs">
                        <div className="font-semibold">{formatDate(payment.paid_at || payment.created_at).split(' ')[0]}</div>
                        <div className="text-muted-foreground">
                          {formatDate(payment.paid_at || payment.created_at).split(' ').slice(1).join(' ')}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">
                          {formatCurrency(payment.amount)}
                        </div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {payment.payment_type} • {payment.payment_method.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                    {payment.status && (
                      <Badge variant={getStatusVariant(payment.status)}>
                        {payment.status}
                      </Badge>
                    )}
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
