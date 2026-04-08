
import { Link, router } from '@inertiajs/react';
import { Building, Users, Home, Settings, LogOut, Plus } from 'lucide-react';
import { route } from 'ziggy-js';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminDashboardProps {
    stats?: {
        total_properties: number;
        total_units: number;
        active_tenancies: number;
    };
}

export default function Dashboard({ stats }: AdminDashboardProps) {
    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <h1 className="text-xl font-semibold text-foreground">Admin Dashboard</h1>
                        <Button variant="outline" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-foreground">Welcome, Admin</h2>
                    <p className="text-muted-foreground">Manage your properties, landlords, and tenants from here.</p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <Link href={route('admin.properties.index')}>
                            <CardHeader className="text-center">
                                <Building className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                                <CardTitle className="text-lg">Properties</CardTitle>
                                <CardDescription>
                                    Manage all properties
                                </CardDescription>
                            </CardHeader>
                        </Link>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <Link href={route('admin.users.index')}>
                            <CardHeader className="text-center">
                                <Users className="mx-auto h-8 w-8 text-green-600 mb-2" />
                                <CardTitle className="text-lg">Landlords</CardTitle>
                                <CardDescription>
                                    Manage landlords
                                </CardDescription>
                            </CardHeader>
                        </Link>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer opacity-50">
                        <CardHeader className="text-center">
                            <Home className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                            <CardTitle className="text-lg">Tenants</CardTitle>
                            <CardDescription>
                                Manage tenants (Coming Soon)
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer opacity-50">
                        <CardHeader className="text-center">
                            <Settings className="mx-auto h-8 w-8 text-orange-600 mb-2" />
                            <CardTitle className="text-lg">Settings</CardTitle>
                            <CardDescription>
                                System settings (Coming Soon)
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Properties</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats?.total_properties || 0}</div>
                            <p className="text-xs text-muted-foreground">Properties in system</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Units</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats?.total_units || 0}</div>
                            <p className="text-xs text-muted-foreground">Units across all properties</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">Active Tenancies</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats?.active_tenancies || 0}</div>
                            <p className="text-xs text-muted-foreground">Currently active</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Latest updates across the system
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No recent activity to display</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Add */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <Link href={route('admin.properties.create')}>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Property
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 