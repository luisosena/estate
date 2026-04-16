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

import React from 'react';
import { router } from '@inertiajs/react';
import LandlordLayout from '@/components/layout/LandlordLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
interface Tenant {
  id: number;
  full_name: string;
}

interface Unit {
  id: number;
  unit_name: string;
  unit_code: string;
  property: Property;
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
    links: { url: string | null; label: string; active: boolean }[];
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
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  Infrastructure
                </Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Utilities
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage utilities setup for all tenancies
              </p>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-6">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Active Tenancies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {tenancies.data.filter((t) => t.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tenancies with Utilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {tenancies.data.filter((t) => t.tenancyUtilities?.length > 0).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Utilities Assigned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
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
                <p className="text-muted-foreground">No active tenancies found.</p>
              </CardContent>

            </Card>
          ) : (
            tenancies.data.map((tenancy) => (
              <Card key={tenancy.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg font-medium text-foreground">
                      {tenancy.tenant.full_name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {tenancy.unit?.unit_name} • {tenancy.unit?.property?.name}
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
                    <p className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border/60 rounded-lg">
                      No utilities assigned to this tenancy yet.
                    </p>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {tenancy.tenancyUtilities.map((utility) => {
                        const Icon = getUtilityIcon(utility.utility_type.name);
                        return (
                          <div
                            key={utility.id}
                            className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background border border-border/50 shadow-sm">
                                <Icon className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {utility.utility_type.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
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

        {/* Pagination */}
        {tenancies.last_page > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(tenancies.current_page - 1) * tenancies.per_page + 1} to{' '}
              {Math.min(tenancies.current_page * tenancies.per_page, tenancies.total)} of{' '}
              {tenancies.total} results
            </div>
            <div className="flex gap-1">
              {tenancies.links.map((link, index) => (
                <Button
                  key={index}
                  variant={link.active ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handlePageChange(link.url)}
                  disabled={!link.url}
                >
                  <span dangerouslySetInnerHTML={{ __html: link.label }} />
                </Button>
              ))}
            </div>
          </div>
        )}
          </div>
        </main>
  );
}

LandlordUtilitiesIndex.layout = (page: React.ReactNode) => <LandlordLayout>{page}</LandlordLayout>;
