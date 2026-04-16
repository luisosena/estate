import { Link, usePage } from '@inertiajs/react';
import {
  Droplets,
  Zap,
  Wifi,
  Shield,
  CreditCard,
  CalendarDays,
  TrendingUp,
  History,
} from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
import { MetricCard } from '@/components/shared/DashboardComponents';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { formatCurrency, getFormattedDate, getStatusVariant } from '@/lib/formatters';
import { type SharedData } from '@/types';

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



const getUtilityIcon = (typeName: string) => {
  const name = typeName?.toLowerCase() || '';
  if (name.includes('water')) return Droplets;
  if (name.includes('electric') || name.includes('power')) return Zap;
  if (name.includes('internet') || name.includes('wifi')) return Wifi;
  if (name.includes('security')) return Shield;
  return Zap;
};

export default function TenantUtilities({
  tenant,
  tenancy,
  utilities,
  summary,
}: Props) {
  const { auth } = usePage<SharedData>().props;

  return (
    <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <SidebarTrigger className="-ml-2 md:hidden" />
                    <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
                        <CalendarDays className="w-3 h-3" />
                        {getFormattedDate()}
                    </Badge>
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Utility Services
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your active utilities and view upcoming billing estimates.
                </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <Button asChild variant="outline" className="bg-card border-border/50 shadow-sm hidden sm:flex">
                    <Link href={route('tenant.utilities.bills')}>
                        <History className="w-4 h-4 mr-2 text-muted-foreground" />
                        Billing History
                    </Link>
                </Button>
                <Button asChild className="shadow-sm">
                    <Link href={route('tenant.payments.make')}>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay Bills
                    </Link>
                </Button>
            </div>
        </header>

        {/* No Tenancy State */}
        {!tenancy ? (
          <Card className="shadow-none border-dashed border-2">
            <CardContent className="py-20 text-center flex flex-col items-center gap-4">
              <Zap className="h-12 w-12 text-muted-foreground opacity-20" />
              <div>
                <h3 className="text-xl font-semibold">No active tenancy</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mt-1">
                  Utilities are tied to an active lease. Please contact your property manager to finalize your move-in.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* KPI Summary Row */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Property Context"
                    value={tenancy.unit}
                    icon={Shield}
                    description={tenancy.property}
                />
                <MetricCard
                    title="Active Services"
                    value={`${summary.active_count} / ${summary.utilities_count}`}
                    icon={Zap}
                    description="Provisioned utility lines"
                    trend={summary.active_count < summary.utilities_count ? { label: "Suspended services found", value: "" } : undefined}
                    alert={summary.active_count < summary.utilities_count}
                />
                <MetricCard
                    title="Monthly Estimate"
                    value={formatCurrency(summary.monthly_total)}
                    icon={TrendingUp}
                    description="Projected utility costs"
                />
                <MetricCard
                    title="Billing Cycle"
                    value="Monthly"
                    icon={CalendarDays}
                    description="Standard billing interval"
                />
            </section>

            {/* Main Content: Services List */}
            <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold tracking-tight">Active Services</h2>
                    <Badge variant="outline" className="font-normal text-muted-foreground">
                        Last synced: Today
                    </Badge>
                </div>

                <Card className="shadow-none border-border/50 overflow-hidden">
                    <CardHeader className="border-b bg-muted/30">
                        <CardTitle className="text-base">Service Catalog</CardTitle>
                        <CardDescription>Direct-billed utility types assigned to your unit.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {utilities.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center gap-2">
                                <Shield className="h-10 w-10 text-muted-foreground opacity-30" />
                                <p className="text-lg font-medium">No services assigned yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50">
                                {utilities.map((utility) => {
                                    const Icon = getUtilityIcon(utility.utility_type?.name);
                                    return (
                                        <div
                                            key={utility.id}
                                            className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary/10 transition-colors">
                                                    <Icon className="w-6 h-6 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg leading-tight">
                                                        {utility.utility_type?.name || 'Unknown Service'}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground mt-0.5">
                                                        {formatCurrency(utility.amount)} / {utility.billing_cycle}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge 
                                                variant={getStatusVariant(utility.status)} 
                                                className="shadow-none rounded-full px-3 capitalize"
                                            >
                                                {utility.status}
                                            </Badge>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>

            {/* Informational Hint */}
            <div className="bg-muted/40 border p-4 rounded-xl flex gap-3 items-start">
                <Shield className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Note: Billing estimates are based on your lease agreement. Actual costs for metered utilities (Water/Electricity) may vary based on consumption if managed directly by utility providers. Check your individual bills for precise totals.
                </p>
            </div>
          </>
        )}

    </main>
  );
}


TenantUtilities.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
