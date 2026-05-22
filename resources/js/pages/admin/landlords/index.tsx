import { Link, router } from '@inertiajs/react';
import {
    Activity,
    Building2,
    Edit,
    Eye,
    Plus,
    Search,
    ShieldCheck,
    Users,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';
import React, { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import Pagination from '@/components/shared/Pagination';
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

declare function route(name: string, params?: any): string;

/* ─── Interfaces ────────────────────────────────────────────────── */

interface Landlord {
    id: number;
    name: string;
    username: string;
    email: string;
    email_verified_at: string | null;
    properties_count: number;
    created_at: string;
}

interface Stats {
    total_landlords: number;
    active_landlords: number;
    inactive_landlords: number;
    total_properties: number;
}

interface AdminLandlordsIndexProps {
    landlords: {
        data: Landlord[];
        links: any[];
        meta: {
            current_page: number;
            total: number;
            per_page: number;
            links: Array<{
                url: string | null;
                label: string;
                active: boolean;
            }>;
        };
    };
    stats: Stats;
    filters: {
        search: string;
        status: string;
    };
}

/* ─── Helper Components ─────────────────────────────────────────── */

const MetricCard = ({ title, value, icon: Icon, description, alert = false }: any) => (
    <Card className={`overflow-hidden transition-all border-border/50 ${alert ? 'border-amber-200/50 dark:border-amber-500/20' : ''}`}>
        <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
                    <h3 className="text-3xl font-black tracking-tight">{value}</h3>
                    <p className="text-[10px] text-muted-foreground font-medium">{description}</p>
                </div>
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${alert ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary animate-pulse-subtle'}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </CardContent>
    </Card>
);

const getStatusVariant = (verified: boolean): "default" | "secondary" | "destructive" | "outline" | null => {
    return verified ? 'default' : 'secondary';
};

/* ─── Main Component ─────────────────────────────────────────────── */

export default function AdminLandlords({ landlords, stats, filters }: AdminLandlordsIndexProps) {
    const [localFilters, setLocalFilters] = useState({
        search: filters?.search || '',
        status: filters?.status || 'all'
    });
    
    const { data: landlordList, meta } = landlords;
    const links = meta.links;

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
                        <CardDescription className="flex items-center justify-between">
                            <span>Manage user roles and verification status</span>
                            <span className="text-xs font-medium">Viewing {landlordList.length} of {meta.total} records</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {landlordList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl border-muted/50">
                                <Users className="h-10 w-10 text-muted/40 mb-3" />
                                <p className="text-sm text-muted-foreground font-medium">No landlords matching your filters</p>
                                <Button variant="link" onClick={() => setLocalFilters({ search: '', status: 'all' })} className="mt-2 text-xs">
                                    Clear all filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {landlordList.map((landlord) => (
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
                        <div className="mt-8 pt-4 border-t border-border/50">
                            <Pagination links={links} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}

AdminLandlords.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
