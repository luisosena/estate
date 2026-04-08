import { Link } from '@inertiajs/react';
import {
  Plus,
  Zap,
  Droplets,
  Wifi,
  Shield,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import { route } from 'ziggy-js';

import { LandlordSidebar } from '@/components/layout/landlord-sidebar';
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

interface Unit {
  id: number;
  unit_name: string;
  unit_code: string;
}

interface Property {
  id: number;
  name: string;
  address: string;
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

interface Tenancy {
  id: number;
  status: string;
  unit: Unit;
  property: Property;
  tenant: Tenant;
  tenancyUtilities: TenancyUtility[];
}

interface Props {
  tenancies: {
    data: Tenancy[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
  }).format(amount);

const getUtilityIcon = (typeName: string) => {
  const name = typeName.toLowerCase();
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

export default function LandlordUtilitiesIndex({ tenancies }: Props) {
  return (
    <SidebarProvider defaultOpen={false}>
      <LandlordSidebar properties={[]} />
      <SidebarInset className="px-6 pt-4 pb-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-200">Utilities</h1>
            <p className="text-sm text-gray-400">
              Manage utilities for all tenancies
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Active Tenancies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-200">
                {tenancies.data.filter((t) => t.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Tenancies with Utilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-200">
                {tenancies.data.filter((t) => t.tenancyUtilities?.length > 0).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Utilities Assigned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-200">
                {tenancies.data.reduce(
                  (acc, t) => acc + (t.tenancyUtilities?.length || 0),
                  0,
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tenancies List */}
        <div className="space-y-4">
          {tenancies.data.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-400">No active tenancies found.</p>
              </CardContent>
            </Card>
          ) : (
            tenancies.data.map((tenancy) => (
              <Card key={tenancy.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg font-medium text-gray-200">
                      {tenancy.tenant.full_name}
                    </CardTitle>
                    <p className="text-sm text-gray-400">
                      {tenancy.unit.unit_name} • {tenancy.property.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{tenancy.status}</Badge>
                    <Link
                      href={route('landlord.utilities.create', { tenancy: tenancy.id })}
                    >
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Utility
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {tenancy.tenancyUtilities?.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4 text-center">
                      No utilities assigned to this tenancy yet.
                    </p>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {tenancy.tenancyUtilities.map((utility) => {
                        const Icon = getUtilityIcon(utility.utility_type.name);
                        return (
                          <div
                            key={utility.id}
                            className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800/50 p-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-700">
                                <Icon className="h-5 w-5 text-gray-300" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-200">
                                  {utility.utility_type.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {formatCurrency(utility.amount)} /{' '}
                                  {utility.billing_cycle}
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
            ))
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
