import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Building2, Home, Plus, Eye, Filter, BedDouble, Users, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

import LandlordLayout from '@/components/layout/LandlordLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';



interface Unit {
  id: number;
  unit_code: string;
  unit_name: string;
  status: 'available' | 'occupied';
  property: {
    id: number;
    name: string;
  };
  created_at: string;
}

interface Property {
  id: number;
  name: string;
}

interface Metrics {
  total_units: number;
  available_units: number;
  occupied_units: number;
  occupancy_rate: number;
  total_properties: number;
}

interface UnitsIndexProps {
  units: Unit[];
  properties: Property[];
  selectedProperty: string;
  metrics: Metrics;
  propertyMetrics: Metrics | null;
}

export default function UnitsIndex({ units, properties, selectedProperty, metrics, propertyMetrics }: UnitsIndexProps) {
  const [currentProperty, setCurrentProperty] = useState(selectedProperty);

  const handlePropertyChange = (value: string) => {
    setCurrentProperty(value);
    router.get('/landlord/units', { property: value }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const currentMetrics = propertyMetrics || metrics;

  const getStatusBadge = (status: string) => {
    return status === 'available' ? (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        Available
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800">
        Occupied
      </Badge>
    );
  };

  // Group units by property when "all" is selected
  const groupedUnits = currentProperty === 'all' 
    ? units.reduce((groups, unit) => {
      const propertyName = unit.property.name;
      if (!groups[propertyName]) {
        groups[propertyName] = [];
      }
      groups[propertyName].push(unit);
      return groups;
    }, {} as Record<string, Unit[]>)
    : null;

  const PropertySeparator = () => (
    <div className="flex items-center justify-center py-4">
      <div className="border-t border-gray-200 flex-1"></div>
      <div className="px-4 text-sm text-gray-500">•</div>
      <div className="border-t border-gray-200 flex-1"></div>
    </div>
  );

  return (
    <>
      <Head title="Units" />
      <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
          
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
                  <Home className="w-3 h-3" />
                  Portfolio Asset
                </Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Units
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage all your property units
              </p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/landlord/units/create">
                <Button className="shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Unit
                </Button>
              </Link>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-6">

          {/* Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Units</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentMetrics.total_units}</div>
                <p className="text-xs text-muted-foreground">Across all properties</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Units</CardTitle>
                <BedDouble className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentMetrics.available_units}</div>
                <p className="text-xs text-muted-foreground">Ready for tenants</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Occupied Units</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentMetrics.occupied_units}</div>
                <p className="text-xs text-muted-foreground">Currently rented</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentMetrics.occupancy_rate}%</div>
                <p className="text-xs text-muted-foreground">Of total units</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Properties</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentMetrics.total_properties}</div>
                <p className="text-xs text-muted-foreground">Total properties</p>
              </CardContent>
            </Card>
          </div>

          {/* Property Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Filter by Property:</span>
                  <Select value={currentProperty} onValueChange={handlePropertyChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {units.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No units found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {currentProperty === 'all' 
                    ? "Get started by adding your first unit to a property."
                    : `No units found for the selected property.`
                  }
                </p>
                <Link href="/landlord/units/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Unit
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  {currentProperty === 'all' ? 'All Units' : `Units - ${properties.find(p => p.id.toString() === currentProperty)?.name}`}
                </CardTitle>
                <CardDescription>
                  {currentProperty === 'all' 
                    ? 'All units across your properties, grouped by property'
                    : `Units for the selected property`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentProperty === 'all' && groupedUnits ? (
                  <div className="space-y-6">
                    {Object.entries(groupedUnits).map(([propertyName, propertyUnits], index) => (
                      <div key={propertyName}>
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            {propertyName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {propertyUnits.length} unit{propertyUnits.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          {propertyUnits.map((unit) => (
                            <div
                              key={unit.id}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-3">
                                  <Home className="h-8 w-8 text-muted-foreground" />
                                  <div>
                                    <div className="font-medium">{unit.unit_name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      Code: {unit.unit_code}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                {getStatusBadge(unit.status)}
                                <Link href={`/landlord/units/${unit.id}`}>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {index < Object.entries(groupedUnits).length - 1 && <PropertySeparator />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {units.map((unit) => (
                      <div
                        key={unit.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-3">
                            <Home className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{unit.unit_name}</div>
                              <div className="text-sm text-muted-foreground">
                                Code: {unit.unit_code}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Property: {unit.property.name}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(unit.status)}
                          <Link href={`/landlord/units/${unit.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          </div>
        </main>
    </>
  );
}

UnitsIndex.layout = (page: React.ReactNode) => <LandlordLayout>{page}</LandlordLayout>;
