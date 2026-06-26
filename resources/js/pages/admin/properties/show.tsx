import { Link, router } from '@inertiajs/react';
import {
    Activity,
    ArrowLeft,
    Building,
    Building2,
    CheckCircle,
    ChevronRight,
    Edit,
    Home,
    Mail,
    MapPin,
    Plus,
    Settings,
    ShieldCheck,
    Trash2,
    Users,
} from 'lucide-react';
import React from 'react';
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
import { Separator } from '@/components/ui/separator';

/* ─── Interfaces ─────────────────────────────────────────────────── */

interface Landlord {
    id: number;
    name: string;
    username: string;
    email: string;
    role: string;
}

interface Unit {
    id: number;
    unit_name: string;
    unit_code: string;
    status: string;
    tenant?: {
        id: number;
        full_name: string;
    };
}

interface Property {
    id: number;
    landlord_id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    property_type: string;
    total_units: number;
    status: string;
    description: string;
    amenities: string[];
    policies: string[];
    landlord: Landlord;
    units: {
        data: Unit[];
    };
    created_at: string;
}

interface AdminPropertyShowProps {
    property: Property;
}

/* ─── Helpers ────────────────────────────────────────────────────── */

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'active':
            return 'default';
        case 'inactive':
            return 'secondary';
        case 'maintenance':
            return 'outline';
        default:
            return 'secondary';
    }
};

const getUnitStatusVariant = (status: string) => {
    switch (status) {
        case 'available':
            return 'outline';
        case 'occupied':
            return 'default';
        case 'maintenance':
            return 'secondary';
        default:
            return 'secondary';
    }
};

/* ─── Main Component ─────────────────────────────────────────────── */

export default function AdminPropertyShow({ property }: AdminPropertyShowProps) {
    const deleteProperty = () => {
        if (confirm('Are you sure you want to delete this property? This action cannot be undone. All associated units and tenancies must be resolved first.')) {
            router.delete(route('admin.properties.destroy', property.id));
        }
    };

    return (
        <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
            
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                    <Link
                        href={route('admin.properties.index')}
                        className="h-8 w-8 flex items-center justify-center rounded-full border border-border/50 bg-background hover:bg-muted text-muted-foreground transition-colors"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                    </Link>
                    <span>Property Insights</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                    <Button asChild variant="outline" size="sm" className="h-9 font-bold text-xs gap-2">
                        <Link href={route('admin.properties.edit', property.id)}>
                            <Edit className="h-3.5 w-3.5" />
                            Update Records
                        </Link>
                    </Button>
                    
                    <Button variant="outline" size="sm" onClick={deleteProperty} className="h-9 font-bold text-xs gap-2 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" />
                        Decommission
                    </Button>
                </div>
            </header>

            <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/10 transition-transform hover:scale-105">
                    <Building2 className="h-8 w-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {property.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <Badge variant={getStatusVariant(property.status)} className="text-[10px] uppercase font-bold px-2 h-5">
                            {property.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-primary/60" /> {property.address}, {property.city}
                        </span>
                        <Separator orientation="vertical" className="h-3 hidden sm:block" />
                        <span className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-primary/60" /> Managed by {property.landlord.name}
                        </span>
                    </div>
                </div>
            </div>

            <Separator className="opacity-50" />

            {/* Metrics Overview */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <MetricCard 
                    title="Total Capacity"
                    value={property.total_units}
                    icon={Home}
                    description="Inventory registered"
                />
                <MetricCard 
                    title="Occupancy Level"
                    value={property.units.data.filter(u => u.status === 'occupied').length}
                    icon={ShieldCheck}
                    description="Units currently active"
                />
                <MetricCard 
                    title="Real-time Availability"
                    value={property.units.data.filter(u => u.status === 'available').length}
                    icon={Activity}
                    description="Ready for acquisition"
                />
                <MetricCard 
                    title="Asset Type"
                    value={property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)}
                    icon={Building}
                    description="Structural classification"
                />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Inventory & Amenities */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    
                    {/* Units Directory */}
                    <Card className="shadow-none border-border/50 overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
                            <div>
                                <CardTitle className="text-lg font-bold uppercase tracking-tight">Units Directory</CardTitle>
                                <CardDescription>Structural breakdown of the property portfolio.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {property.units.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <Building2 className="h-10 w-10 text-muted/40 mb-3" />
                                    <p className="text-sm text-muted-foreground font-medium">No units registered for this complex</p>
                                    <Button variant="link" className="text-xs uppercase font-bold tracking-widest mt-2">Initialize Units</Button>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/50">
                                    {property.units.data.map((unit) => (
                                        <div key={unit.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                    <Home className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm">{unit.unit_name}</h4>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{unit.unit_code}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {unit.tenant && (
                                                    <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mr-4">
                                                        <Users className="h-3 w-3" /> {unit.tenant.full_name}
                                                    </span>
                                                )}
                                                <Badge variant={getUnitStatusVariant(unit.status)} className="text-[9px] uppercase font-bold px-1.5 h-4 border-none shadow-none">
                                                    {unit.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Amenities List */}
                        <Card className="shadow-none border-border/50">
                            <CardHeader className="pb-3 border-b border-border/50">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Property Features</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 flex flex-wrap gap-1.5">
                                {property.amenities && property.amenities.length > 0 ? (
                                    property.amenities.map((amenity, i) => (
                                        <Badge key={i} variant="secondary" className="bg-muted/50 text-[10px] font-bold text-muted-foreground shadow-none">
                                            {amenity}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-xs text-muted-foreground italic">No specialized amenities listed.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Policies List */}
                        <Card className="shadow-none border-border/50">
                            <CardHeader className="pb-3 border-b border-border/50">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Governing Policies</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-2">
                                {property.policies && property.policies.length > 0 ? (
                                    property.policies.map((policy, i) => (
                                        <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground font-medium">
                                            <span className="h-1 w-1 rounded-full bg-primary mt-1.5 shrink-0" />
                                            {policy}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-muted-foreground italic">No specialized policies defined.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column: Manager Summary & Metadata */}
                <div className="flex flex-col gap-6">
                    
                    {/* Landlord Focus */}
                    <Card className="shadow-none border-border/50 bg-primary/5 border-primary/10">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/80">Asset Owner</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-background border border-primary/10 flex items-center justify-center text-primary group">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-sm truncate">{property.landlord.name}</h4>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Account: @{property.landlord.username}</p>
                                </div>
                            </div>
                            <Button asChild variant="outline" size="sm" className="w-full text-[10px] font-bold uppercase tracking-widest gap-2 bg-background border-primary/20 hover:bg-primary/5">
                                <Link href={route('admin.landlords.show', property.landlord.id)}>
                                    Manage Portfolio <ChevronRight className="h-3 w-3" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Timeline & Meta */}
                    <Card className="shadow-none border-border/50">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Registration Data</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4 text-xs font-semibold">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground/70">Database Signature</span>
                                <span>#PRP-{property.id.toString().padStart(4, '0')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground/70">Integration Date</span>
                                <span>{new Date(property.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground/70">System Integrity</span>
                                <Badge variant="secondary" className="bg-success/10 text-success border-none h-4 px-1.5 text-[9px] uppercase">Verified</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Help Section */}
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                        <h5 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                             <ShieldCheck className="h-3 w-3" /> System Control Note
                        </h5>
                        <p className="text-[11px] text-muted-foreground leading-relaxed font-medium italic">
                            Administrators possess global override controls for all property attributes. Any modifications will be recorded in the system audit logs.
                        </p>
                    </div>

                </div>
            </div>
        </main>
    );
}

AdminPropertyShow.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
