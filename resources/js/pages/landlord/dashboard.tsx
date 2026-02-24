import { LandlordSidebar } from '@/components/layout/landlord-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Link, router } from '@inertiajs/react';
import { ArrowRight, Building2, DollarSign, Home, Plus, Users } from 'lucide-react';
import { route } from 'ziggy-js';

interface Property {
    id: number;
    name: string;
    address: string;
    units_count: number;
    active_tenants_count: number;
}

interface Stats {
    total_tenants: number;
    total_properties: number;
    total_units: number;
    monthly_revenue: number;
}

interface LandlordDashboardProps {
    properties: Property[];
    stats: Stats;
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'TZS',
        minimumFractionDigits: 0,
    }).format(amount);

export default function Dashboard({ properties, stats }: LandlordDashboardProps) {
    const handleLogout = () => {
        router.post('/logout');
    };

    const handleAddTenant = () => {
        router.visit('/landlord/tenants/create');
    };

    return (
        <SidebarProvider defaultOpen={false}>
            <LandlordSidebar properties={properties} />
            <SidebarInset className="px-6 pt-4 pb-8">
                {/* Mobile sidebar trigger */}
                <div className="flex items-center gap-2 mb-4 md:hidden">
                    <SidebarTrigger className="-ml-2" />
                    <h1 className="text-lg font-semibold">Dashboard</h1>
                </div>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Landlord Dashboard</h1>
                        <p className="mt-1 text-muted-foreground">Welcome back! Manage your properties and tenants.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={route('landlord.tenants.index')}>
                                <Users className="mr-2 h-4 w-4" />
                                View All Tenants
                            </Link>
                        </Button>
                        <Button onClick={handleAddTenant}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Tenant
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_tenants}</div>
                            <p className="text-xs text-muted-foreground">Active tenants across all properties</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Properties</CardTitle>
                            <Home className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_properties}</div>
                            <p className="text-xs text-muted-foreground">{stats.total_units} total units</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {/*{formatCurrency(stats.monthly_revenue)}*/}
                            </div>
                            <p className="text-xs text-muted-foreground">Expected monthly income</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_units > 0
                                    ? Math.round((stats.total_tenants / stats.total_units) * 100)
                                    : 0}
                                %
                            </div>
                            <p className="text-xs text-muted-foreground">Units occupied</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Properties Overview */}
                <div className="grid gap-6 lg:grid-cols-2 mb-8">
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Properties Overview</CardTitle>
                                <CardDescription>Your properties and their current occupancy</CardDescription>
                            </div>
                            <Button asChild variant="outline" size="sm">
                                <Link href={route('landlord.tenants.index')}>
                                    View All Tenants
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {properties.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Home className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                    <p>No properties found. Add your first property to get started.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {properties.map((property) => (
                                        <div
                                            key={property.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <h3 className="font-medium">{property.name}</h3>
                                                <p className="text-sm text-muted-foreground">{property.address}</p>
                                            </div>
                                            <div className="flex items-center gap-6 text-sm">
                                                <div className="text-center">
                                                    <p className="font-medium">{property.units_count}</p>
                                                    <p className="text-muted-foreground">Units</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-medium">{property.active_tenants_count}</p>
                                                    <p className="text-muted-foreground">Tenants</p>
                                                </div>
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={route('landlord.properties.tenants', property.id)}>
                                                        View Tenants
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks and shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <Button onClick={handleAddTenant} className="justify-start" variant="outline">
                                <Plus className="mr-2 h-4 w-4" />
                                Add New Tenant
                            </Button>
                            <Button asChild variant="outline" className="justify-start">
                                <Link href={route('landlord.tenants.index')}>
                                    <Users className="mr-2 h-4 w-4" />
                                    View All Tenants
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-start">
                                <Link href={route('landlord.tenants.index')}>
                                    <Home className="mr-2 h-4 w-4" />
                                    Manage Properties
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-start">
                                <Link href={route('landlord.tenants.index')}>
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    View Payments
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Logout */}
                <div className="mt-8 flex justify-center">
                    <Button variant="outline" onClick={handleLogout}>
                        Log out
                    </Button>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
