import { Link } from '@inertiajs/react';
import {
  Droplets,
  Zap,
  Wifi,
  Shield,
  CreditCard,
} from 'lucide-react';
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
}

interface UtilityType {
  id: number;
  name: string;
  unit: string | null;
}

interface TenancyUtility {
  id: number;
  amount: number;
  billing_cycle: string;
  status: string;
  utility_type: UtilityType;
}

interface Props {
  tenant: Tenant;
  tenancy?: {
    id: number;
    unit: string;
    property: string;
    monthly_rent: number;
  } | null;
  utilities: TenancyUtility[];
  summary: {
    monthly_total: number;
    active_count: number;
    utilities_count: number;
  };
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
  }).format(amount);

const getUtilityIcon = (typeName: string) => {
  const name = typeName?.toLowerCase() || '';
  if (name.includes('water')) return Droplets;
  if (name.includes('electric') || name.includes('power')) return Zap;
  if (name.includes('internet') || name.includes('wifi')) return Wifi;
  if (name.includes('security')) return Shield;
  return Zap;
};

const getStatusVariant = (
  status?: string,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'default';
    case 'suspended':
      return 'secondary';
    case 'disconnected':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function TenantUtilities({
  tenant,
  tenancy,
  utilities,
  summary,
}: Props) {
  return (
    <SidebarProvider defaultOpen={false}>
      <TenantSidebar />
      <SidebarInset className="px-6 pt-4 pb-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-2xl font-bold">My Utilities</h1>
            <p className="text-sm text-muted-foreground">
              View your utility services and billing
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

        {/* Tenancy Info & Summary */}
        {tenancy && (
          <>
            {/* Property Info */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Your Property</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Property</p>
                    <p className="font-medium">{tenancy.property}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Unit</p>
                    <p className="font-medium">{tenancy.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Rent</p>
                    <p className="font-medium">{formatCurrency(tenancy.monthly_rent)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Utilities</p>
                    <p className="font-medium">{formatCurrency(summary.monthly_total)} / month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Utilities List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Utility Services</CardTitle>
                <Link href={route('tenant.utilities.bills')}>
                  <Button variant="outline" size="sm">
                    <CreditCard className="mr-2 h-4 w-4" />
                    View Bills
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {utilities.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">
                      No utilities assigned to your tenancy yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {utilities.map((utility) => {
                      const Icon = getUtilityIcon(utility.utility_type?.name);
                      return (
                        <div
                          key={utility.id}
                          className="flex items-center justify-between rounded-lg border p-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                              <Icon className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {utility.utility_type?.name || 'Unknown'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(utility.amount)} / {utility.billing_cycle}
                              </p>
                            </div>
                          </div>
                          <Badge variant={getStatusVariant(utility.status)}>
                            {utility.status}
                          </Badge>
                        </div>
                      );
                    })}
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
