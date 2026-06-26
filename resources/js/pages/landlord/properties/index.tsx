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
import React from 'react';

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
  properties: {
    data: Property[];
    links: any[];
    meta: {
      current_page: number;
      from: number;
      last_page: number;
      path: string;
      per_page: number;
      to: number;
      total: number;
      links: Array<{
        url: string | null;
        label: string;
        active: boolean;
      }>;
    };
  };
  stats: Stats;
}

const getOccupancyVariant = (rate: number): 'default' | 'secondary' | 'destructive' => {
  if (rate >= 90) return 'default';
  if (rate >= 70) return 'secondary';
  return 'destructive';
};

export default function LandlordProperties({ properties, stats }: LandlordPropertiesProps) {
  const { data: propertyList, meta } = properties;
  const links = meta.links;

  return (
    <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
          
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
                  <Building2 className="w-3 h-3" />
                  Portfolio Overview
                </Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Properties
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and track the performance of all your buildings
              </p>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-6">
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
            
            {propertyList.length === 0 ? (
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
              <div className="flex flex-col gap-6">
                <div className="grid gap-4">
                  {propertyList.map((property) => (
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
                          <Badge variant={getOccupancyVariant(property.occupancy_rate)}>
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
                
                {/* Pagination */}
                <Card>
                    <CardContent className="py-4">
                        <Pagination links={links} />
                    </CardContent>
                </Card>
              </div>
            )}
          </div>
          </div>
    </main>
  );
}

LandlordProperties.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
