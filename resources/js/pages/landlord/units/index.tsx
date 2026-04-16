import { Head, Link, router } from '@inertiajs/react';
import { Building2, Home, Plus, Eye, Filter, BedDouble, Users, TrendingUp } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { route } from 'ziggy-js';

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
  units: {
    data: Unit[];
    links: any[];
    meta: {
      current_page: number;
      total: number;
      links: Array<{
        url: string | null;
        label: string;
        active: boolean;
      }>;
    };
  };
  properties: {
    data: Property[];
  };
  selectedProperty: string;
  metrics: Metrics;
  propertyMetrics: Metrics | null;
}

export default function UnitsIndex({ units, properties, selectedProperty, metrics, propertyMetrics }: UnitsIndexProps) {
  const [currentProperty, setCurrentProperty] = useState(selectedProperty);

  const { data: unitList, meta } = units;
  const links = meta.links;
  const propertyList = properties.data || [];

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
      <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400">
        Available
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400">
        Occupied
      </Badge>
    );
  };

  // Group units by property for the current page
  const groupedUnits = useMemo(() => {
    return currentProperty === 'all' 
      ? unitList.reduce((groups, unit) => {
        const propertyName = unit.property?.name || 'Unassigned';
        if (!groups[propertyName]) {
          groups[propertyName] = [];
        }
        groups[propertyName].push(unit);
        return groups;
      }, {} as Record<string, Unit[]>)
      : null;
  }, [currentProperty, unitList]);

  const PropertySeparator = () => (
    <div className="flex items-center justify-center py-4">
      <div className="border-t border-border/50 flex-1"></div>
      <div className="px-4 text-sm text-muted-foreground">•</div>
      <div className="border-t border-border/50 flex-1"></div>
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
                Manage all your property units efficiently
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
            <Card className="border-border/50 shadow-none bg-muted/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Units</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black">{currentMetrics.total_units}</div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-none bg-emerald-500/5 border-emerald-500/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-emerald-600">Available</CardTitle>
                <BedDouble className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-emerald-600">{currentMetrics.available_units}</div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-none bg-rose-500/5 border-rose-500/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-rose-600">Occupied</CardTitle>
                <Users className="h-4 w-4 text-rose-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-rose-600">{currentMetrics.occupied_units}</div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-none bg-primary/5 border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary">Occupancy</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-primary">{currentMetrics.occupancy_rate}%</div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-none bg-muted/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Buildings</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black">{currentMetrics.total_properties}</div>
              </CardContent>
            </Card>
          </div>

          {/* Property Filter */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Filter Portfolio</span>
                </div>
                <Select value={currentProperty} onValueChange={handlePropertyChange}>
                    <SelectTrigger className="w-full sm:w-64 bg-muted/30 border-none shadow-none text-xs font-semibold">
                      <SelectValue placeholder="All Properties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      {propertyList.map((property) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {unitList.length === 0 ? (
            <Card className="border-border/50 border-dashed bg-muted/10">
              <CardContent className="flex flex-col items-center justify-center py-20">
                <Building2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">No units found</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-sm">
                  {currentProperty === 'all' 
                    ? "Your portfolio doesn't have any units registered yet. Get started by adding your first one."
                    : `We couldn't find any units belonging to the selected property.`
                  }
                </p>
                <Link href="/landlord/units/create">
                  <Button className="font-bold text-xs uppercase tracking-widest h-10 px-6">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Unit
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-muted/20">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold">
                          {currentProperty === 'all' ? 'Consolidated Inventory' : `Units - ${propertyList.find(p => p.id.toString() === currentProperty)?.name}`}
                        </CardTitle>
                        <CardDescription>
                          {currentProperty === 'all' 
                            ? 'Displaying all units across your properties for the current page'
                            : `Management view for selected property units`
                          }
                        </CardDescription>
                    </div>
                    <div className="hidden sm:block px-3 py-1 bg-background rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-border/50 text-center">
                        {meta.total} Total Units
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {currentProperty === 'all' && groupedUnits ? (
                  <div className="divide-y divide-border/30">
                    {Object.entries(groupedUnits).map(([propertyName, propertyUnits], groupIndex) => (
                      <div key={propertyName} className="p-4 sm:p-6 bg-background/50">
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-black text-foreground flex items-center gap-2 uppercase tracking-wide">
                                <Building2 className="h-4 w-4 text-primary" />
                                {propertyName}
                            </h3>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                                {propertyUnits.length} Units on this page
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {propertyUnits.map((unit) => (
                            <div
                              key={unit.id}
                              className="group flex items-center justify-between p-4 border border-border/50 rounded-xl bg-card hover:bg-primary/5 hover:border-primary/20 transition-all shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <Home className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <div className="font-bold text-sm text-foreground truncate">{unit.unit_name}</div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                      {unit.unit_code}
                                    </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {getStatusBadge(unit.status)}
                                <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 text-primary">
                                    <Link href={`/landlord/units/${unit.id}`}>
                                      <Eye className="h-4 w-4" />
                                    </Link>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-border/30">
                    {unitList.map((unit) => (
                      <div
                        key={unit.id}
                        className="flex items-center justify-between p-5 hover:bg-muted/20 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-muted group-hover:bg-primary/5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all border border-border/50">
                            <Home className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="font-bold text-foreground">{unit.unit_name}</div>
                            <div className="flex items-center gap-3 mt-1">
                                <Badge variant="outline" className="text-[10px] font-bold border-muted-foreground/20 leading-none h-4 uppercase">
                                  {unit.unit_code}
                                </Badge>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                                    <Building2 className="h-2.5 w-2.5" />
                                    {unit.property?.name}
                                </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {getStatusBadge(unit.status)}
                          <Button asChild variant="outline" size="sm" className="h-9 px-4 text-xs font-bold border-border/50 bg-background hover:bg-muted group/btn">
                              <Link href={`/landlord/units/${unit.id}`}>
                                <Eye className="h-3.5 w-3.5 mr-2 group-hover/btn:scale-110 transition-transform" />
                                View Details
                              </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Pagination */}
                <div className="p-4 border-t bg-muted/20">
                    <Pagination links={links} />
                </div>
              </CardContent>
            </Card>
          )}
          </div>
        </main>
    </>
  );
}

UnitsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
