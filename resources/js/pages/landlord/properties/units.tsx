import { Head, Link } from '@inertiajs/react';
import { Building2, Home, Plus, Eye, ArrowLeft } from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Unit {
  id: number;
  unit_code: string;
  unit_name: string;
  status: 'available' | 'occupied';
  created_at: string;
}

interface Property {
  id: number;
  name: string;
  address: string;
  total_units: number;
}

interface PropertyUnitsProps {
  property: Property;
  units: {
    data: Unit[];
  };
}

export default function PropertyUnits({ property, units }: PropertyUnitsProps) {
  const unitsList = units?.data || [];

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

  const availableUnits = unitsList.filter(unit => unit.status === 'available').length;
  const occupiedUnits = unitsList.filter(unit => unit.status === 'occupied').length;

  return (
    <>
      <Head title={`${property.name} - Units`} />
      <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
          
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
                  <Building2 className="w-3 h-3" />
                  Portfolio Asset
                </Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                {property.name} Units
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {property.address}
              </p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Link href={route('landlord.dashboard')}>
                <Button variant="outline" className="bg-card border-border/50 shadow-sm hidden sm:flex">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <Link href={route('landlord.units.create')}>
                <Button className="shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Unit
                </Button>
              </Link>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Units</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{property.total_units}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available</CardTitle>
                <div className="h-4 w-4 bg-green-500 rounded-full" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{availableUnits}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Occupied</CardTitle>
                <div className="h-4 w-4 bg-red-500 rounded-full" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{occupiedUnits}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Units</CardTitle>
              <CardDescription>
                All units for {property.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unitsList.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No units yet</h3>
                  <p className="text-muted-foreground mb-4">
                    This property doesn't have any units yet. Add your first unit to get started.
                  </p>
                  <Link href={route('landlord.units.create')}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Unit
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {unitsList.map((unit) => (
                    <div
                      key={unit.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                          <Building2 className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{unit.unit_name}</div>
                            <div className="text-sm text-muted-foreground">
                              Code: {unit.unit_code}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Added: {unit.created_at}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(unit.status)}
                        <Link href={route('landlord.units.show', unit.id)}>
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
          </div>
        </main>
    </>
  );
}

PropertyUnits.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
