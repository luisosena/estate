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
  Info,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
import { MetricCard } from '@/components/shared/DashboardComponents';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';

interface UtilityType {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
}

interface TenancyUtility {
  id: number;
  amount: number;
  billing_cycle: string;
  status: string;
  utility_type: UtilityType;
}

interface Props {
  tenant: {
    id: number;
    full_name: string;
  };
  tenancy?: {
    id: number;
    unit: string;
    property: string;
    monthly_rent: number;
  } | null;
  utilities: {
      data: TenancyUtility[];
  };
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

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return (
        <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 font-black text-[10px] uppercase tracking-widest px-2">
          Active
        </Badge>
      );
    case 'suspended':
      return (
        <Badge variant="secondary" className="bg-amber-500 hover:bg-amber-600 font-black text-[10px] uppercase tracking-widest px-2">
          Suspended
        </Badge>
      );
    case 'disconnected':
      return (
        <Badge variant="destructive" className="font-black text-[10px] uppercase tracking-widest px-2">
          Inactive
        </Badge>
      );
    default:
      return <Badge variant="outline" className="font-black text-[10px] uppercase tracking-widest px-2">{status}</Badge>;
  }
};

export default function TenantUtilities({
  tenant,
  tenancy,
  utilities,
  summary,
}: Props) {
  const { auth } = usePage<SharedData>().props;
  const utilityList = utilities?.data || [];

  return (
    <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <SidebarTrigger className="-ml-2 md:hidden" />
                    <Badge variant="outline" className="text-[10px] bg-card font-black text-muted-foreground border-border/50 flex gap-1.5 items-center uppercase tracking-widest">
                        <Zap className="w-3 h-3" />
                        Provisioning
                    </Badge>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-foreground">
                    In-Unit Services
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Review your active utility subscriptions and estimated monthly costs.
                </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <Button asChild variant="outline" className="bg-card border-border/50 shadow-sm font-bold text-xs uppercase tracking-widest gap-2">
                    <Link href={route('tenant.utilities.bills')}>
                        <History className="w-4 h-4 opacity-70" />
                        Billing Logs
                    </Link>
                </Button>
                <Button asChild className="shadow-lg shadow-primary/20 font-bold text-xs uppercase tracking-widest gap-2">
                    <Link href={route('tenant.payments.make')}>
                        <CreditCard className="w-4 h-4" />
                        Pay Balance
                    </Link>
                </Button>
            </div>
        </header>

        {/* No Tenancy State */}
        {!tenancy ? (
          <Card className="shadow-none border-dashed border-2 border-border/50 bg-muted/5">
            <CardContent className="py-24 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center border border-border/50">
                    <Shield className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <div className="max-w-xs">
                <h3 className="text-sm font-black uppercase tracking-widest">No Active Occupation</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter mt-1 opacity-70">
                  Utility assignments are established during the move-in process. Please coordinate with management for unit activation.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* KPI Summary Row */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Active Residence"
                    value={tenancy.unit}
                    icon={Shield}
                    description={tenancy.property}
                />
                <MetricCard
                    title="Healthy Services"
                    value={`${summary.active_count} / ${summary.utilities_count}`}
                    icon={Zap}
                    description="Provisioned utility lines"
                    alert={summary.active_count < summary.utilities_count}
                />
                <MetricCard
                    title="Projected Cost"
                    value={formatCurrency(summary.monthly_total)}
                    icon={TrendingUp}
                    description="Estimated monthly overhead"
                />
                <MetricCard
                    title="Cycle Frequency"
                    value="Monthly"
                    icon={CalendarDays}
                    description="Standard billing period"
                />
            </section>

            {/* Main Content: Services List */}
            <section className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black tracking-tight">Active Provisioning</h2>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-muted/20 border border-border/50 rounded-full text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        System Synchronized
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {utilityList.length === 0 ? (
                        <Card className="col-span-full border-dashed border-2 border-border/50 bg-muted/5">
                             <CardContent className="py-20 text-center flex flex-col items-center gap-2">
                                <Info className="h-10 w-10 text-muted-foreground opacity-20" />
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">No recurring services identified</p>
                            </CardContent>
                        </Card>
                    ) : (
                        utilityList.map((utility) => {
                            const Icon = getUtilityIcon(utility.utility_type?.name);
                            return (
                                <Card key={utility.id} className="border-border/50 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                                    <div className="p-6 flex flex-col gap-6">
                                        <div className="flex items-start justify-between">
                                            <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary/10 transition-colors">
                                                <Icon className="w-7 h-7 text-primary" />
                                            </div>
                                            {getStatusBadge(utility.status)}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-lg uppercase tracking-tight text-foreground truncate">
                                                {utility.utility_type?.name}
                                            </h4>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-xl font-black text-foreground">
                                                    {formatCurrency(utility.amount)}
                                                </p>
                                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-border/30 bg-muted/10 h-5">
                                                    {utility.billing_cycle}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-6 py-3 bg-muted/10 border-t border-border/30 flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Last reading: —</span>
                                        <Button variant="link" asChild className="p-0 text-[10px] font-black uppercase tracking-widest h-auto text-primary hover:no-underline">
                                            <Link href={route('tenant.utilities.bills', { type_id: utility.utility_type.id })}>
                                                Ledger &rarr;
                                            </Link>
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>
            </section>

            {/* Advisory Section */}
            <Card className="border-none shadow-none bg-primary/[0.02] border-l-[3px] border-l-primary rounded-none overflow-hidden">
                <CardContent className="p-6 flex gap-4 items-start">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-primary shrink-0" />
                    </div>
                    <div className="space-y-1">
                        <h5 className="text-xs font-black uppercase tracking-widest text-foreground">Provisioning Advisory</h5>
                        <p className="text-[10px] font-bold text-muted-foreground leading-relaxed uppercase tracking-tighter opacity-80">
                            Billing estimates reflect standard lease allocations. Consumption-based utilities (Water/Power) may differ from base projections if individually metered. Please refer to your latest digital logs for exact settlement amounts and usage verification.
                        </p>
                    </div>
                </CardContent>
            </Card>
          </>
        )}

    </main>
  );
}

TenantUtilities.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
