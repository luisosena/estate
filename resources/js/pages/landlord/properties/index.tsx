import { Link, router } from '@inertiajs/react';
import {
  ArrowRight,
  Building2,
  Home,
  Users,
  MapPin,
  TrendingUp,
  BedDouble,
  Plus
} from 'lucide-react';

import { LandlordSidebar } from '@/components/layout/landlord-sidebar';
import { Badge } from '@/components/ui/badge';
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

interface Property {
  id: number;
  name: string;
  address: string;
  total_units: number;
  units_count: number;
  active_tenants_count: number;
  occupied_units: number;
  available_units: number;
  occupancy_rate: number;
}

interface Stats {
  total_properties: number;
  total_units: number;
  total_occupied_units: number;
  total_available_units: number;
  overall_occupancy_rate: number;
}

interface LandlordPropertiesProps {
  properties: Property[];
  stats: Stats;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TZS',
  }).format(amount);

const getOccupancyColor = (rate: number) => {
  if (rate >= 90) return 'bg-green-100 text-green-800';
  if (rate >= 70) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

export default function LandlordProperties({ properties, stats }: LandlordPropertiesProps) {
  return (
    <SidebarProvider>
      <LandlordSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            <h1 className="text-lg font-semibold">Properties</h1>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_properties}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Units</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_units}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Occupied Units</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_occupied_units}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Units</CardTitle>
                <BedDouble className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_available_units}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overall_occupancy_rate}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Properties List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Properties</h2>
            
            {properties.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No properties yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Get started by adding your first property to manage your rental portfolio.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {properties.map((property) => (
                  <Card key={property.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{property.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="h-4 w-4" />
                            {property.address}
                          </CardDescription>
                        </div>
                        <Badge className={getOccupancyColor(property.occupancy_rate)}>
                          {property.occupancy_rate}% Occupied
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{property.units_count}</div>
                          <div className="text-sm text-muted-foreground">Total Units</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{property.occupied_units}</div>
                          <div className="text-sm text-muted-foreground">Occupied</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{property.available_units}</div>
                          <div className="text-sm text-muted-foreground">Available</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{property.active_tenants_count}</div>
                          <div className="text-sm text-muted-foreground">Active Tenants</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/landlord/properties/${property.id}/tenants`}>
                            <Users className="h-4 w-4 mr-2" />
                            View Tenants
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/landlord/properties/${property.id}/units`}>
                            <Home className="h-4 w-4 mr-2" />
                            View Units
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/landlord/properties/${property.id}`}>
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
