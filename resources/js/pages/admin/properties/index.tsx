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
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
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
        meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 },
    };

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);

        router.get(route('admin.properties.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = (value: string) => {
        setLocalFilters({ ...localFilters, search: value });

        // Debounce search
        const timeoutId = setTimeout(() => {
            router.get(
                route('admin.properties.index'),
                { ...localFilters, search: value },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }, 300);

        return () => clearTimeout(timeoutId);
    };

    const deleteProperty = (id: number) => {
        if (
            confirm(
                'Are you sure you want to delete this property? This action cannot be undone.',
            )
        ) {
            router.delete(route('admin.properties.destroy', id));
        }
    };

    return (
        <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
            
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Global Properties
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Monitor and manage all buildings registered in the system.
                    </p>
                </div>
                <Button asChild size="lg" className="shadow-md">
                    <Link href={route('admin.properties.create')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Register Property
                    </Link>
                </Button>
            </header>

            <Separator className="opacity-50" />

            {/* Metrics Grid (Simple view for index) */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <MetricCard 
                    title="Managed Buildings"
                    value={safeProperties.meta.total}
                    icon={Building2}
                    description="Total registered properties"
                />
                <MetricCard 
                    title="Active"
                    value={safeProperties.data.filter(p => p.status === 'active').length}
                    icon={Building}
                    description="Buildings currently in service"
                />
                <MetricCard 
                    title="Total Units"
                    value={safeProperties.data.reduce((acc, p) => acc + p.total_units, 0)}
                    icon={Home}
                    description="Units across listed properties"
                />
                <MetricCard 
                    title="Total Landlords"
                    value={landlords.length}
                    icon={Users}
                    description="Contributing owners"
                />
            </section>

            {/* Filter & List Section */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search properties by name or address..."
                            value={localFilters.search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-9 bg-muted/30 border-none shadow-none focus-visible:ring-1"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Select value={localFilters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                            <SelectTrigger className="w-[140px] bg-muted/30 border-none shadow-none text-xs font-semibold">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all text-xs">All Status</SelectItem>
                                <SelectItem value="active text-xs">Active</SelectItem>
                                <SelectItem value="inactive text-xs">Inactive</SelectItem>
                                <SelectItem value="maintenance text-xs">Maintenance</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={localFilters.owner_id} onValueChange={(value) => handleFilterChange('owner_id', value)}>
                            <SelectTrigger className="w-[180px] bg-muted/30 border-none shadow-none text-xs font-semibold">
                                <SelectValue placeholder="All Landlords" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all text-xs">All Landlords</SelectItem>
                                {landlords.map((landlord) => (
                                    <SelectItem key={landlord.id} value={landlord.id.toString()} className="text-xs">
                                        {landlord.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Card className="shadow-none border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold">Property Directory</CardTitle>
                        <CardDescription>
                            Management list for all buildings and rental complexes
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {safeProperties.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl border-muted/50">
                                <Building2 className="h-10 w-10 text-muted/40 mb-3" />
                                <p className="text-sm text-muted-foreground font-medium">No properties found</p>
                                <p className="text-xs text-muted-foreground/60 mt-1 uppercase tracking-wider font-bold">Try adjusting your filters</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {safeProperties.data.map((property) => (
                                    <div
                                        key={property.id}
                                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-border/40 hover:border-primary/20 hover:bg-muted/30 transition-all group"
                                    >
                                        <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                            <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/10 transition-colors shadow-sm">
                                                <Building2 className="h-6 w-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-foreground truncate">{property.name}</h3>
                                                    <Badge variant="outline" className={getStatusColor(property.status) + " text-[10px] uppercase font-bold px-1.5 h-4 border-none shadow-none"}>
                                                        {property.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate leading-normal">
                                                    {property.address}, {property.city}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1 underline-offset-4 decoration-muted/30">
                                                    <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                                        <Home className="h-2.5 w-2.5" />
                                                        {property.total_units} units
                                                    </span>
                                                    <Separator orientation="vertical" className="h-2 bg-muted-foreground/30" />
                                                    <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-tighter">
                                                        <Users className="h-2.5 w-2.5" />
                                                        {property.landlord?.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                            <Button asChild variant="outline" size="sm" className="h-8 text-xs font-semibold border-border/50 bg-background hover:bg-muted flex-1 sm:flex-none">
                                                <Link href={route('admin.properties.show', property.id)}>
                                                    <Eye className="h-3.5 w-3.5 mr-1" /> View
                                                </Link>
                                            </Button>
                                            
                                            <Button asChild variant="outline" size="sm" className="h-8 text-xs font-semibold border-border/50 bg-background hover:bg-muted flex-1 sm:flex-none">
                                                <Link href={route('admin.properties.edit', property.id)}>
                                                    <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                                                </Link>
                                            </Button>
                                            
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 text-xs font-semibold border-border/50 text-destructive hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive flex-1 sm:flex-none"
                                                onClick={() => deleteProperty(property.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {safeProperties.meta.last_page > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-border/50">
                                <span className="text-xs font-medium text-muted-foreground">
                                    Displaying {((safeProperties.meta.current_page - 1) * safeProperties.meta.per_page) + 1} - {Math.min(safeProperties.meta.current_page * safeProperties.meta.per_page, safeProperties.meta.total)} of {safeProperties.meta.total} properties
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

AdminProperties.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
