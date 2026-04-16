import { Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    Building2,
    CalendarDays,
    ChevronRight,
    Home,
    Plus,
    ShieldCheck,
    Users,
} from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

import AdminLayout from '@/components/layout/AdminLayout';
import { MetricCard, QuickAction } from '@/components/shared/DashboardComponents';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { type SharedData } from '@/types';

/* ─── Interfaces ─────────────────────────────────────────────────── */

interface AdminDashboardProps {
    stats?: {
        total_properties: number;
        total_units: number;
        active_tenancies: number;
        total_landlords?: number;
    };
}

/* ─── Formatting Helpers ─────────────────────────────────────────── */

const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

/* ─── Main Component ─────────────────────────────────────────────── */

export default function Dashboard({ stats }: AdminDashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const adminName = auth?.user?.name ?? 'Admin';

    return (
        <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
            
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium uppercase tracking-wider">{getFormattedDate()}</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        System Overview
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, <span className="text-foreground font-semibold">{adminName}</span>. Here's what's happening across the platform.
                    </p>
                </div>
            </header>

            <Separator className="opacity-50" />

            {/* Metrics Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <MetricCard 
                    title="Total Properties"
                    value={stats?.total_properties || 0}
                    icon={Building2}
                    description="Total properties registered"
                />
                <MetricCard 
                    title="Total Units"
                    value={stats?.total_units || 0}
                    icon={Home}
                    description="Units across all buildings"
                />
                <MetricCard 
                    title="Active Tenancies"
                    value={stats?.active_tenancies || 0}
                    icon={ShieldCheck}
                    description="Units currently occupied"
                />
                <MetricCard 
                    title="Total Landlords"
                    value={stats?.total_landlords || 0}
                    icon={Users}
                    description="Active property managers"
                />
            </section>

            {/* Bottom Section: Quick Actions & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Activity Feed (Mocked for now) */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card className="shadow-none border-border/50 h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-lg font-bold">System Activity</CardTitle>
                                <CardDescription>Latest management updates</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs gap-1">
                                View Logs <ChevronRight className="h-3 w-3" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl border-muted/50">
                                <Activity className="h-10 w-10 text-muted/40 mb-3" />
                                <p className="text-sm text-muted-foreground font-medium">Activity feed integration pending</p>
                                <p className="text-xs text-muted-foreground/60 max-w-[200px] mt-1">Real-time system events will appear here once connected.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Quick Actions */}
                <div className="flex flex-col gap-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Quick Management</h2>
                    <div className="grid grid-cols-1 gap-3">
                        <QuickAction 
                            label="Add New Property"
                            icon={Plus}
                            href={route('admin.properties.create')}
                        />
                        <QuickAction 
                            label="New Landlord Account"
                            icon={Users}
                            href={route('admin.landlords.create')}
                        />
                        <QuickAction 
                            label="System Settings"
                            icon={ShieldCheck}
                            className="bg-primary/5 border-primary/20 hover:bg-primary/10"
                            disabled
                        />
                    </div>

                    {/* Simple Help Card */}
                    <Card className="bg-primary text-primary-foreground border-none mt-4 shadow-md overflow-hidden relative group">
                        <div className="absolute -right-4 -top-4 bg-white/10 w-24 h-24 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                        <CardHeader className="relative pb-2">
                            <CardTitle className="text-base font-bold">Admin Support</CardTitle>
                            <CardDescription className="text-primary-foreground/70 text-xs">Need help with system controls?</CardDescription>
                        </CardHeader>
                        <CardContent className="relative">
                            <p className="text-xs mb-4 leading-relaxed font-medium">
                                Access the platform documentation for managing landlords, verifying accounts, and property audits.
                            </p>
                            <Button size="sm" variant="secondary" className="w-full text-xs font-bold gap-2 group/btn">
                                View Docs <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>

            </div>

        </main>
    );
}

Dashboard.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;