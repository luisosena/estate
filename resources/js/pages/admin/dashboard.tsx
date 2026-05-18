import { usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    ChevronRight,
    Plus,
    ShieldCheck,
    Users,
} from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
import { MetricCard, QuickAction } from '@/components/shared/DashboardComponents';
import { RevenueTrendChart } from '@/components/shared/revenue-trend-chart';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { type SharedData } from '@/types';

/* ─── Interfaces ─────────────────────────────────────────────────── */

interface ActivityItem {
    id: number;
    type: string;
    title: string;
    description: string;
    time: string;
    icon: string;
}

interface AdminDashboardProps {
    stats?: {
        total_properties: number;
        total_units: number;
        active_tenancies: number;
        total_landlords: number;
        pending_landlords: number;
        maintenance_properties: number;
    };
    activity?: ActivityItem[];
    revenueTrend?: {
        month: string;
        label: string;
        total_revenue: number;
        payment_count: number;
    }[];
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

const ActivityIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'landlord_registration':
            return <Users className="h-4 w-4" />;
        case 'property_registration':
            return <Building2 className="h-4 w-4" />;
        default:
            return <Activity className="h-4 w-4" />;
    }
};

/* ─── Main Component ─────────────────────────────────────────────── */

export default function Dashboard({ stats, activity = [], revenueTrend = [] }: AdminDashboardProps) {
    const adminName = usePage<SharedData>().props.auth?.user?.name ?? 'Admin';

    return (
        <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12 text-balance">
            
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
                <MetricCard 
                    title="Pending Reviews"
                    value={stats?.pending_landlords || 0}
                    icon={Activity}
                    description="Landlords requiring verification"
                    alert={(stats?.pending_landlords || 0) > 0}
                />
            </section>

            <Separator className="opacity-50" />

            {/* Revenue Chart */}
            <section>
                <RevenueTrendChart data={revenueTrend} title="System Revenue Trend" />
            </section>

            {/* Bottom Section: Quick Actions & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Activity Feed */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card className="shadow-none border-border/50 h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
                            <div>
                                <CardTitle className="text-lg font-bold uppercase tracking-tight">System Activity</CardTitle>
                                <CardDescription>Latest management and registration updates</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs gap-1 font-bold">
                                View Logs <ChevronRight className="h-3 w-3" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {activity.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <Activity className="h-10 w-10 text-muted/40 mb-3" />
                                    <p className="text-sm text-muted-foreground font-medium">No recent activity detected</p>
                                    <p className="text-xs text-muted-foreground/60 max-w-[200px] mt-1">System events will appear here in real-time.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/50">
                                    {activity.map((item, index) => (
                                        <div key={index} className="flex items-start gap-4 p-5 hover:bg-muted/30 transition-colors group">
                                            <div className="mt-0.5 h-8 w-8 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/10 transition-transform group-hover:scale-105">
                                                <ActivityIcon type={item.type} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-4">
                                                    <h4 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{item.title}</h4>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase whitespace-nowrap">{item.time}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed font-medium capitalize">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Quick Actions */}
                <div className="flex flex-col gap-6">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 px-1">Control Hub</h2>
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
                            label="Audit Reports"
                            icon={Activity}
                            className="bg-secondary/5 border-secondary/20 hover:bg-secondary/10"
                            href={route('admin.audit-reports')}
                        />
                    </div>

                    {/* Simple Help Card */}
                    <Card className="bg-primary text-primary-foreground border-none mt-4 shadow-lg shadow-primary/10 overflow-hidden relative group">
                        <div className="absolute -right-4 -top-4 bg-white/10 w-24 h-24 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                        <CardHeader className="relative pb-2">
                            <CardTitle className="text-sm font-black uppercase tracking-widest">Admin Support</CardTitle>
                            <CardDescription className="text-primary-foreground/70 text-[10px] font-bold">Standardized system controls</CardDescription>
                        </CardHeader>
                        <CardContent className="relative">
                            <p className="text-xs mb-4 leading-relaxed font-semibold opacity-90">
                                Access documentation for landlord moderation, asset verification, and system audits.
                            </p>
                            <Button size="sm" variant="secondary" className="w-full text-[10px] font-bold uppercase tracking-widest gap-2 group/btn h-9">
                                View Docs <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Meta Info */}
                    <div className="mt-auto pt-6 flex items-center justify-between px-1">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">System Version</span>
                            <span className="text-xs font-bold font-mono">v2.1.0-PRO</span>
                        </div>
                        <ShieldCheck className="h-8 w-8 text-muted/20" />
                    </div>
                </div>

            </div>

        </main>
    );
}

Dashboard.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;