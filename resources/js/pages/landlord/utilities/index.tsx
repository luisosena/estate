import { Link, router } from '@inertiajs/react';
import {
  Plus,
  Zap,
  Droplets,
  Wifi,
  Shield,
  LayoutGrid,
  Info,
  ChevronRight,
} from 'lucide-react';
import React, { useMemo } from 'react';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
import Pagination from '@/components/shared/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
  tenancy_utilities: TenancyUtility[];
}

interface Props {
  tenancies: {
    data: Tenancy[];
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
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

const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return (
        <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 font-bold text-[10px] uppercase tracking-widest px-2 shadow-sm">
          Active
        </Badge>
      );
    case 'suspended':
      return (
        <Badge variant="secondary" className="bg-amber-500 hover:bg-amber-600 font-bold text-[10px] uppercase tracking-widest px-2 shadow-sm">
          Suspended
        </Badge>
      );
    case 'disconnected':
      return (
        <Badge variant="destructive" className="font-bold text-[10px] uppercase tracking-widest px-2 shadow-sm">
          Disconnected
        </Badge>
      );
    default:
      return <Badge variant="outline" className="font-bold text-[10px] uppercase tracking-widest px-2">{status}</Badge>;
  }
};

export default function LandlordUtilitiesIndex({ tenancies }: Props) {
  const { data: tenancyList, meta } = tenancies;
  const links = meta.links;

  const stats = useMemo(() => ({
    activeTenancies: tenancyList.filter((t) => t.status === 'active').length,
    tenanciesWithUtilities: tenancyList.filter((t) => t.tenancy_utilities?.length > 0).length,
    totalUtilitiesAssigned: tenancyList.reduce((acc, t) => acc + (t.tenancy_utilities?.length || 0), 0)
  }), [tenancyList]);

  return (
        <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
          
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px] bg-card font-black text-muted-foreground border-border/50 flex gap-1.5 items-center uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  Service Management
                </Badge>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-foreground">
                Provisioning
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Configure utility assignments and billing cycles for active tenancies
              </p>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-8">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-border/50 shadow-none bg-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Tenancies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-foreground">
                    {stats.activeTenancies}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50 shadow-none bg-primary/5 border-primary/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary">Provisioned Units</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-primary">
                    {stats.tenanciesWithUtilities}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50 shadow-none bg-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Global Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-foreground">
                    {stats.totalUtilitiesAssigned}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tenancies List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black tracking-tight">Tenancy Inventory</h3>
                  <div className="px-3 py-1 bg-background rounded-full text-[10px] font-black text-muted-foreground uppercase tracking-widest border border-border/50">
                        {meta.total} Active Records
                  </div>
              </div>

              {tenancyList.length === 0 ? (
                <Card className="border-border/50 border-dashed shadow-none bg-muted/10">
                  <CardContent className="py-24 text-center">
                    <LayoutGrid className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                    <h4 className="text-sm font-black uppercase tracking-widest">No active tenancies discovered</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter mt-1">Assign tenants to units to begin service provisioning</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                    {tenancyList.map((tenancy) => (
                    <Card key={tenancy.id} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b bg-muted/5">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center font-black text-primary text-xl">
                                {tenancy.tenant.full_name.charAt(0)}
                            </div>
                            <div>
                                <CardTitle className="text-lg font-black">{tenancy.tenant.full_name}</CardTitle>
                                <CardDescription className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                    {tenancy.unit?.unit_name} <ChevronRight className="h-3 w-3" /> {tenancy.unit?.property?.name}
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-black text-[10px] uppercase tracking-widest px-2 py-0.5 border-border/50 bg-background">{tenancy.status}</Badge>
                            <Button size="sm" asChild className="font-black text-[10px] uppercase tracking-widest h-8 px-4 shadow-lg shadow-primary/20">
                                <Link href={route('landlord.utilities.create', { tenancy: tenancy.id })}>
                                    <Plus className="mr-2 h-3 w-3" />
                                    Assign Utility
                                </Link>
                            </Button>
                        </div>
                        </CardHeader>
                        <CardContent className="p-6">
                        {tenancy.tenancy_utilities?.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center text-center opacity-60">
                                <Info className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No service dependencies assigned</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {tenancy.tenancy_utilities?.map((utility) => {
                                const Icon = getUtilityIcon(utility.utility_type.name);
                                return (
                                <Link
                                    key={utility.id}
                                    href={route('landlord.utilities.edit', { tenancyUtility: utility.id })}
                                    className="group relative flex flex-col gap-4 rounded-2xl border border-border/50 bg-card p-5 hover:border-primary/30 transition-all hover:bg-primary/[0.01]"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 border border-primary/10 transition-colors group-hover:bg-primary/10">
                                            <Icon className="h-5 w-5 text-primary" />
                                        </div>
                                        {getStatusBadge(utility.status)}
                                    </div>
                                    <div>
                                        <p className="font-black text-sm uppercase tracking-tight text-foreground">
                                        {utility.utility_type.name}
                                        </p>
                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-xs font-bold text-muted-foreground">
                                                {formatCurrency(utility.amount)}
                                            </p>
                                            <Badge variant="outline" className="text-[9px] font-black uppercase border-border/30 bg-muted/20 px-1.5 leading-none h-4">
                                                {utility.billing_cycle}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Badge variant="outline" className="text-[8px] bg-background border-primary/20 text-primary uppercase font-bold px-1 py-0 shadow-sm">Manage</Badge>
                                    </div>
                                </Link>
                                );
                            })}
                            </div>
                        )}
                        </CardContent>
                    </Card>
                    ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-8 border-border/50">
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Asset Portfolio Strategy: {meta.total} Provisioning Targets
                </p>
                <Pagination links={links} />
            </div>
          </div>
        </main>
  );
}

LandlordUtilitiesIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
