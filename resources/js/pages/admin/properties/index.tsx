import { Link, router } from '@inertiajs/react';
import {
    Building,
    Building2,
    Edit,
    Eye,
    Home,
    Plus,
    Search,
    Trash2,
    Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { route } from 'ziggy-js';

import AdminLayout from '@/components/layout/AdminLayout';
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

/* ─── Interfaces ─────────────────────────────────────────────────── */

interface Landlord {
    id: number;
    name: string;
}

interface Property {
    id: number;
    owner_id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    property_type: string;
    total_units: number;
    status: string;
    landlord: Landlord;
    created_at: string;
}

interface AdminPropertiesProps {
    properties: {
        data: Property[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    landlords: Landlord[];
    filters: {
        search: string;
        status: string;
        owner_id: string;
    };
}

/* ─── Helpers ────────────────────────────────────────────────────── */

const getStatusColor = (status: string) => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        case 'inactive':
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-800';
        case 'maintenance':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

/* ─── Main Component ─────────────────────────────────────────────── */

export default function AdminProperties({
    properties,
    landlords,
    filters,
}: AdminPropertiesProps) {
    const [localFilters, setLocalFilters] = useState({
        search: filters?.search || '',
        status: filters?.status || 'all',
        owner_id: filters?.owner_id || 'all',
    });

    const safeProperties = properties || {
        data: [],
        links: [],
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    };

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);

        router.get(route('admin.properties.index'), newFilters, {
            preserveState: true,
            replace: true,
        });
    };

    const deleteProperty = (id: number) => {
        if (confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
            router.delete(route('admin.properties.destroy', id));
        }
    };

    return (
        <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
            
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">
                        Global Property Portfolio
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Operational oversight of all registered buildings and units.</p>
                </div>

                <Button asChild className="font-bold text-xs uppercase tracking-widest gap-2 h-11 px-6 shadow-md shadow-primary/10 transition-all hover:translate-y-[-1px]">
                    <Link href={route('admin.properties.create')}>
                        <Plus className="h-4 w-4" />
                        Register New Asset
                    </Link>
                </Button>
            </header>

            <Separator className="opacity-50" />

            {/* Metrics */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <MetricCard 
                    title="Managed Buildings"
                    value={safeProperties.total}
                    icon={Building2}
                    description="Total registered properties"
                />
                <MetricCard 
                    title="Portfolio Units"
                    value={safeProperties.data.reduce((acc, p) => acc + p.total_units, 0)}
                    icon={Home}
                    description="Total housing capacity"
                />
                <MetricCard 
                    title="Active Landlords"
                    value={landlords.length}
                    icon={Users}
                    description="Verified asset managers"
                />
                <MetricCard 
                    title="Pending Reviews"
                    value={safeProperties.data.filter(p => p.status === 'maintenance').length}
                    icon={Building}
                    description="Assets requiring attention"
                />
            </section>

            {/* Filter Bar */}
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 bg-card p-4 rounded-xl border border-border/50">
                    <div className="relative col-span-1 md:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search properties by name or location..."
                            value={localFilters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="pl-9 bg-muted/30 border-none shadow-none focus-visible:ring-1"
                        />
                    </div>
                    
                    <Select value={localFilters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                        <SelectTrigger className="bg-muted/30 border-none shadow-none text-xs font-semibold">
                            <SelectValue placeholder="Status: All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="active">Active Only</SelectItem>
                            <SelectItem value="inactive">Inactive Only</SelectItem>
                            <SelectItem value="maintenance">Maintenance Only</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={localFilters.owner_id} onValueChange={(value) => handleFilterChange('owner_id', value)}>
                        <SelectTrigger className="bg-muted/30 border-none shadow-none text-xs font-semibold">
                            <SelectValue placeholder="Manager: All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Managers</SelectItem>
                            {landlords.map((landlord) => (
                                <SelectItem key={landlord.id} value={landlord.id.toString()}>
                                    {landlord.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Properties List */}
                <Card className="shadow-none border-border/50 overflow-hidden">
                    <CardHeader className="pb-4 border-b border-border/50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-lg font-bold">Property Inventory</CardTitle>
                                <CardDescription>Efficiently manage your global housing assets.</CardDescription>
                            </div>
                            <div className="px-3 py-1 bg-muted/50 rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                {safeProperties.total} Records Found
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {safeProperties.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <Building2 className="h-12 w-12 text-muted/40 mb-4" />
                                <h3 className="text-sm font-bold text-foreground mb-1">No Properties Found</h3>
                                <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-4">Try adjusting your filters or search terms to find what you're looking for.</p>
                                <Button variant="outline" size="sm" onClick={() => setLocalFilters({ search: '', status: 'all', owner_id: 'all' })} className="text-[10px] font-bold uppercase tracking-widest border-border/50 hover:bg-muted transition-colors">
                                    Reset Filters
                                </Button>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/50">
                                {safeProperties.data.map((property) => (
                                    <div key={property.id} className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-5 hover:bg-muted/30 transition-all group">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform border border-primary/10">
                                                <Home className="h-6 w-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                                                        {property.name}
                                                    </h3>
                                                    <Badge variant="outline" className={getStatusColor(property.status) + " text-[10px] border-none uppercase font-bold px-1.5 h-4"}>
                                                        {property.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                                                    <Building className="h-3 w-3 opacity-60" /> {property.address}, {property.city}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5">
                                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-md">
                                                        <Users className="h-3 w-3" /> Managed by {property.landlord.name}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-md">
                                                        <Home className="h-3 w-3" /> {property.total_units} Units
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 xl:self-center">
                                            <Button asChild variant="outline" size="sm" className="h-9 px-4 text-xs font-bold border-border/50 bg-background hover:bg-muted flex-1 xl:flex-none gap-2">
                                                <Link href={route('admin.properties.show', property.id)}>
                                                    <Eye className="h-3.5 w-3.5" /> Details
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" size="sm" className="h-9 px-4 text-xs font-bold border-border/50 bg-background hover:bg-muted flex-1 xl:flex-none gap-2">
                                                <Link href={route('admin.properties.edit', property.id)}>
                                                    <Edit className="h-3.5 w-3.5" /> Edit
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => deleteProperty(property.id)}
                                                className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10 border-border/50 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {safeProperties.last_page > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-t border-border/50 bg-secondary/10">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest hidden sm:inline">
                                    Page {safeProperties.current_page} of {safeProperties.last_page}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    {safeProperties.links.map((link: any, index: number) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 h-8 flex items-center justify-center text-xs font-bold rounded-md transition-all ${
                                                link.active
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : link.url
                                                    ? 'bg-background border border-border/50 hover:bg-muted text-foreground'
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

AdminProperties.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
