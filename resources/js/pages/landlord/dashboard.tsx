import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, Home, DollarSign } from 'lucide-react';

export default function Dashboard() {
    const handleLogout = () => {
        router.post('/logout');
    };

    const handleAddTenant = () => {
        router.visit('/landlord/tenants/create');
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Landlord Dashboard</h1>
                    <p className="mt-2 text-lg text-gray-600">Welcome back! Manage your properties and tenants.</p>
                </div>
                <Button
                    onClick={handleAddTenant}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Add New Tenant
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Active tenants
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Properties</CardTitle>
                        <Home className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Total properties
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$0</div>
                        <p className="text-xs text-muted-foreground">
                            This month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting payment
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Latest tenant and property updates
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-gray-500">
                            No recent activity
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common tasks and shortcuts
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button 
                            onClick={handleAddTenant}
                            className="w-full justify-start"
                            variant="outline"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Tenant
                        </Button>
                        <Button 
                            className="w-full justify-start"
                            variant="outline"
                        >
                            <Home className="mr-2 h-4 w-4" />
                            Manage Properties
                        </Button>
                        <Button 
                            className="w-full justify-start"
                            variant="outline"
                        >
                            <DollarSign className="mr-2 h-4 w-4" />
                            View Payments
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8 flex justify-center">
                <Button
                    variant="outline"
                    onClick={handleLogout}
                >
                    Log out
                </Button>
            </div>
        </div>
    );
}
