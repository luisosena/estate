import { LandlordSidebar } from '@/components/layout/landlord-sidebar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Link, router } from '@inertiajs/react';
import {
  ArrowRight,
  Building2,
  Clock,
  DollarSign,
  Home,
  Plus,
  Receipt,
  Users,
  AlertCircle,
} from 'lucide-react';
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
  pending_rent_bills: number;
  overdue_rent_bills: number;
  total_rent_outstanding: number;
}

interface LandlordDashboardProps {
  properties: Property[];
  stats: Stats;
  unreadNotificationsCount?: number;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
  }).format(amount);

export default function Dashboard({
  properties,
  stats,
  unreadNotificationsCount = 0,
}: LandlordDashboardProps) {
  const handleLogout = () => {
    router.post('/logout');
  };

  const handleAddTenant = () => {
    router.visit('/landlord/tenants/create');
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <LandlordSidebar properties={properties} unreadNotificationsCount={unreadNotificationsCount} />
      <SidebarInset className="px-6 pt-4 pb-8">
        {/* Mobile sidebar trigger */}
        <div className="mb-4 flex items-center gap-2 md:hidden">
          <SidebarTrigger className="-ml-2" />
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Landlord Dashboard
            </h1>
            <p className="mt-1 text-muted-foreground">
              Welcome back! Manage your properties and tenants.
            </p>
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
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Tenants
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_tenants}</div>
              <p className="text-xs text-muted-foreground">
                Active tenants across all properties
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Properties</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_properties}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total_units} total units
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.monthly_revenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Expected monthly income
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Occupancy Rate
              </CardTitle>
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

          <Card className={stats.pending_rent_bills > 0 ? 'border-amber-500 dark:border-amber-500' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Rent Bills
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">
                {stats.pending_rent_bills}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting payment
              </p>
            </CardContent>
          </Card>

          <Card className={stats.overdue_rent_bills > 0 ? 'border-red-500 dark:border-red-500' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Overdue Rent Bills
              </CardTitle>
              {stats.overdue_rent_bills > 0 ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : (
                <Clock className="h-4 w-4 text-muted-foreground" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-500">
                {stats.overdue_rent_bills}
              </div>
              <p className="text-xs text-muted-foreground">
                Past due date
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Outstanding
              </CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.total_rent_outstanding)}
              </div>
              <p className="text-xs text-muted-foreground">
                Unpaid rent amount
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Properties Overview */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Properties Overview</CardTitle>
                <CardDescription>
                  Your properties and their current occupancy
                </CardDescription>
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
                <div className="py-8 text-center text-muted-foreground">
                  <Home className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>
                    No properties found. Add your first property to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">{property.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {property.address}
                        </p>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-medium">{property.units_count}</p>
                          <p className="text-muted-foreground">Units</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">
                            {property.active_tenants_count}
                          </p>
                          <p className="text-muted-foreground">Tenants</p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link
                            href={route(
                              'landlord.properties.units',
                              property.id,
                            )}
                          >
                            View Units
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
              <Button
                onClick={handleAddTenant}
                className="justify-start"
                variant="outline"
              >
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
                <Link href={route('landlord.units.create')}>
                  <Home className="mr-2 h-4 w-4" />
                  Add Unit
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href={route('landlord.payments.index')}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  View Payments
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href={route('landlord.rent-bills.index')}>
                  <Receipt className="mr-2 h-4 w-4" />
                  View Rent Bills
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
