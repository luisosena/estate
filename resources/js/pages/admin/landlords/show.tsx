import { Link, router } from '@inertiajs/react';
import {
    Activity,
    ArrowLeft,
    Building2,
    CheckCircle,
    ChevronRight,
    Edit,
    Home,
    Mail,
    Plus,
    ShieldCheck,
    Trash2,
    Users,
    XCircle,
    Calendar,
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

interface Property {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    total_units: number;
    status: string;
    created_at: string;
}

interface Landlord {
    id: number;
    name: string;
    username: string;
    email: string;
    role: string;
    email_verified_at: string | null;
    created_at: string;
    properties: Property[];
}

interface AdminLandlordShowProps {
    landlord: Landlord;
    stats: {
        total_properties: number;
        total_units: number;
        occupied_units: number;
        active_tenancies: number;
    };
}

/* ─── Helpers ────────────────────────────────────────────────────── */

const getPropertyStatusVariant = (status: string) => {
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

/* ─── Main Component ─────────────────────────────────────────────── */

export default function AdminLandlordShow({ landlord, stats }: AdminLandlordShowProps) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this landlord? This action cannot be undone. Any properties associated with this landlord must be deleted first.')) {
            router.delete(route('admin.landlords.destroy', landlord.id));
        }
    };

    const toggleStatus = () => {
        router.post(route('admin.landlords.toggle-status', landlord.id));
    };

    return (
        <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
            
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                    <Link
                        href={route('admin.landlords.index')}
                        className="h-8 w-8 flex items-center justify-center rounded-full border border-border/50 bg-background hover:bg-muted text-muted-foreground transition-colors"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                    </Link>
                    <span>Account Details</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleStatus}
                        className="h-9 font-bold text-xs gap-2"
                    >
                        {landlord.email_verified_at ? (
                            <>
                                <XCircle className="h-3.5 w-3.5 text-destructive" />
                                Deactivate Account
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-3.5 w-3.5 text-primary" />
                                Activate Account
                            </>
                        )}
                    </Button>
                    
                    <Button asChild variant="outline" size="sm" className="h-9 font-bold text-xs gap-2">
                        <Link href={route('admin.landlords.edit', landlord.id)}>
                            <Edit className="h-3.5 w-3.5" />
                            Edit Profile
                        </Link>
                    </Button>
                    
                    <Button variant="outline" size="sm" onClick={handleDelete} className="h-9 font-bold text-xs gap-2 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                    </Button>
                </div>
            </header>

            <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/10">
                    <Users className="h-8 w-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {landlord.name}
                    </h1>
                    <div className="flex items-center gap-3 mt-1.5">
                        <Badge variant={landlord.email_verified_at ? 'default' : 'secondary'} className="text-[10px] uppercase font-bold px-2 h-5">
                            {landlord.email_verified_at ? 'Verified Manager' : 'Pending Verification'}
                        </Badge>
                        <span className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" /> {landlord.email}
                        </span>
                    </div>
                </div>
            </div>

            <Separator className="opacity-50" />

            {/* Metrics Overview */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <MetricCard 
                    title="Properties Owned"
                    value={stats.total_properties}
                    icon={Building2}
                    description="Total managed buildings"
                />
                <MetricCard 
                    title="Total Units"
                    value={stats.total_units}
                    icon={Home}
                    description="Total rental supply"
                />
                <MetricCard 
                    title="Occupied Supply"
                    value={stats.occupied_units}
                    icon={ShieldCheck}
                    description="Units currently with tenants"
                />
                <MetricCard 
                    title="Active Tenancies"
                    value={stats.active_tenancies}
                    icon={Activity}
                    description="Current rental contracts"
                />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Properties */}
                <div className="lg:col-span-2">
                    <Card className="shadow-none border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <div>
                                <CardTitle className="text-lg font-bold uppercase tracking-tight">Owned Properties</CardTitle>
                                <CardDescription>Inventory managed by this landlord</CardDescription>
                            </div>
                            <Button asChild variant="outline" size="sm" className="h-8 font-bold text-[10px] uppercase tracking-widest gap-2 shadow-sm">
                                <Link href={route('admin.properties.create')}>
                                    <Plus className="h-3.5 w-3.5" />
                                    Register New
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {landlord.properties.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl border-muted/50">
                                    <Building2 className="h-10 w-10 text-muted/40 mb-3" />
                                    <p className="text-sm text-muted-foreground font-medium">No properties associated yet</p>
                                    <p className="text-[10px] text-muted-foreground/60 max-w-[200px] mt-1 font-bold">New property registrations will appear here.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {landlord.properties.map((property) => (
                                        <div
                                            key={property.id}
                                            className="flex items-center justify-between p-4 rounded-xl border border-border/40 hover:border-primary/20 hover:bg-muted/30 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                                                    <Building2 className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-sm truncate">{property.name}</h4>
                                                    <p className="text-xs text-muted-foreground truncate">{property.address}, {property.city}</p>
                                                    <div className="flex items-center gap-3 mt-1 underline-offset-4 decoration-muted/30">
                                                        <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                                            <Home className="h-2.5 w-2.5" />
                                                            {property.total_units} units
                                                        </span>
                                                        <Badge variant={getPropertyStatusVariant(property.status)} className="text-[9px] uppercase font-bold px-1 h-3.5 border-none shadow-none">
                                                            {property.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors">
                                                <Link href={route('admin.properties.show', property.id)}>
                                                    <ChevronRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Profile Summary */}
                <div className="flex flex-col gap-6">
                    <Card className="shadow-none border-border/50 bg-muted/20">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Portfolio Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-5 flex flex-col gap-4 text-sm font-medium">
                            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-background border border-border/40">
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold italic">Contact Email</span>
                                <div className="flex items-center gap-2 text-foreground">
                                    <Mail className="h-3.5 w-3.5 text-primary" />
                                    {landlord.email}
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-background border border-border/40">
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold italic">User Credentials</span>
                                <div className="flex items-center gap-2 text-foreground">
                                    <Users className="h-3.5 w-3.5 text-primary" />
                                    @{landlord.username}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-background border border-border/40">
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold italic">Member Since</span>
                                <div className="flex items-center gap-2 text-foreground">
                                    <Calendar className="h-3.5 w-3.5 text-primary" />
                                    {new Date(landlord.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <AlertTriangleCard 
                        title="Compliance Notice" 
                        message="Ensure all property documents for this landlord are verified across legislative requirements in the current fiscal period." 
                    />
                </div>
            </div>
        </main>
    );
}

function AlertTriangleCard({ title, message }: { title: string, message: string }) {
    return (
        <Card className="bg-orange-50/50 dark:bg-orange-950/10 border-orange-200/50 dark:border-orange-800/30 shadow-none">
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-tighter text-orange-600 dark:text-orange-400">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-orange-600/80 dark:text-orange-400/80 font-medium leading-relaxed italic">
                    {message}
                </p>
            </CardContent>
        </Card>
    );
}

AdminLandlordShow.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
