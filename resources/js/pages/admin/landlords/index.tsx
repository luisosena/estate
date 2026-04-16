import { Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    Building2,
    ChevronRight,
    Edit,
    Eye,
    Plus,
    Search,
    ShieldCheck,
    ToggleLeft,
    ToggleRight,
    Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
import { MetricCard } from '@/components/shared/DashboardComponents';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { type SharedData } from '@/types';

/* ─── Interfaces ─────────────────────────────────────────────────── */

interface Landlord {
    id: number;
    name: string;
    username: string;
    email: string;
    role: string;
    email_verified_at: string | null;
    created_at: string;
    properties_count?: number;
}

interface AdminLandlordsIndexProps {
    landlords: {
        data: Landlord[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total_landlords: number;
        active_landlords: number;
        inactive_landlords: number;
        total_properties: number;
    };
    filters: {
        search: string;
        status: string;
    };
}

/* ─── Helpers ────────────────────────────────────────────────────── */

const getStatusVariant = (isVerified: boolean) => {
    return isVerified ? 'default' : 'secondary';
};

/* ─── Main Component ─────────────────────────────────────────────── */

export default function AdminLandlords({ landlords, stats, filters }: AdminLandlordsIndexProps) {
    const [localFilters, setLocalFilters] = useState({
        search: filters?.search || '',
        status: filters?.status || 'all'
    });
    
    const safeLandlords = landlords || {
        data: [],
        links: [],
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0
    };

    const links = safeLandlords.links;

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        
        router.get(route('admin.landlords.index'), newFilters, {
            preserveState: true,
            replace: true
        });
    };

    const toggleStatus = (id: number) => {
        router.post(route('admin.landlords.toggle-status', id));
    };

    return (
        <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
            
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Landlord Accounts
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Management and moderation of property owner profiles.</p>
                </div>

                <Button asChild className="font-bold text-xs uppercase tracking-widest gap-2 h-11 px-6 shadow-md shadow-primary/10 transition-all hover:translate-y-[-1px]">
                    <Link href={route('admin.landlords.create')}>
                        <Plus className="h-4 w-4" />
                        Provision Account
                    </Link>
                </Button>
            </header>

            <Separator className="opacity-50" />

            {/* Metrics */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <MetricCard 
                    title="Total Managers"
                    value={stats.total_landlords}
                    icon={Users}
                    description="Total registered landlords"
                />
                <MetricCard 
                    title="Active Accounts"
                    value={stats.active_landlords}
                    icon={ShieldCheck}
                    description="Verified and active"
                />
                <MetricCard 
                    title="Inactive"
                    value={stats.inactive_landlords}
                    icon={Activity}
                    description="Pending verification"
                    alert={stats.inactive_landlords > 0}
                />
                <MetricCard 
                    title="System Properties"
                    value={stats.total_properties}
                    icon={Building2}
                    description="Managed across all accounts"
                />
            </section>

            {/* Filter & List Section */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border/50">
                    <div className="relative w-full md:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email or username..."
                            value={localFilters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="pl-9 bg-muted/30 border-none shadow-none focus-visible:ring-1"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mr-2">Status:</span>
                        <Select value={localFilters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                            <SelectTrigger className="w-full md:w-[180px] bg-muted/30 border-none shadow-none">
                                <SelectValue placeholder="All Accounts" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Accounts</SelectItem>
                                <SelectItem value="active">Active Only</SelectItem>
                                <SelectItem value="inactive">Inactive Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Card className="shadow-none border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold">Account Directory</CardTitle>
                        <CardDescription>
                            Showing {safeLandlords.data.length} managers of {safeLandlords.total} total
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {safeLandlords.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl border-muted/50">
                                <Users className="h-10 w-10 text-muted/40 mb-3" />
                                <p className="text-sm text-muted-foreground font-medium">No landlords matching your filters</p>
                                <Button variant="link" onClick={() => setLocalFilters({ search: '', status: 'all' })} className="mt-2 text-xs">
                                    Clear all filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {safeLandlords.data.map((landlord) => (
                                    <div
                                        key={landlord.id}
                                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-border/40 hover:border-primary/20 hover:bg-muted/30 transition-all group"
                                    >
                                        <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                                                <Users className="h-6 w-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-foreground truncate">{landlord.name}</h3>
                                                    <Badge variant={getStatusVariant(!!landlord.email_verified_at)} className="text-[10px] uppercase font-bold px-1.5 h-4">
                                                        {landlord.email_verified_at ? 'Verified' : 'Unverified'}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    @{landlord.username} • {landlord.email}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1 underline-offset-4 decoration-muted/30">
                                                    <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                                        <Building2 className="h-2.5 w-2.5" />
                                                        {landlord.properties_count || 0} Properties
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => toggleStatus(landlord.id)}
                                                className="h-8 text-xs font-semibold gap-2 border-border/50 bg-background hover:bg-muted flex-1 sm:flex-none"
                                            >
                                                {landlord.email_verified_at ? (
                                                    <><ToggleLeft className="h-4 w-4 text-primary" /> Deactivate</>
                                                ) : (
                                                    <><ToggleRight className="h-4 w-4 text-muted-foreground" /> Activate</>
                                                )}
                                            </Button>
                                            
                                            <Button asChild variant="outline" size="sm" className="h-8 text-xs font-semibold border-border/50 bg-background hover:bg-muted flex-1 sm:flex-none">
                                                <Link href={route('admin.landlords.show', landlord.id)}>
                                                    <Eye className="h-3.5 w-3.5 mr-1" /> View
                                                </Link>
                                            </Button>
                                            
                                            <Button asChild variant="outline" size="sm" className="h-8 text-xs font-semibold border-border/50 bg-background hover:bg-muted flex-1 sm:flex-none">
                                                <Link href={route('admin.landlords.edit', landlord.id)}>
                                                    <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {safeLandlords.last_page > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-border/50">
                                <span className="text-xs font-medium text-muted-foreground">
                                    Displaying {((safeLandlords.current_page - 1) * safeLandlords.per_page) + 1} - {Math.min(safeLandlords.current_page * safeLandlords.per_page, safeLandlords.total)} of {safeLandlords.total} results
                                </span>
                                <div className="flex items-center gap-1.5">
                                    {links.map((link: any, index: number) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 h-8 flex items-center justify-center text-xs font-bold rounded-md transition-all ${
                                                link.active
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : link.url
                                                    ? 'bg-background border border-border/50 hover:bg-muted text-muted-foreground'
                                                    : 'opacity-50 pointer-events-none text-muted-foreground/50'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}

AdminLandlords.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
