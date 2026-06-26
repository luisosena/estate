import { Head, Link } from '@inertiajs/react';
import { Building2, Home, Users, Calendar, ArrowLeft } from 'lucide-react';
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


interface Tenant {
  id: string;
  full_name: string;
  email: string;
}

interface Tenancy {
  id: number;
  status: string;
  start_date: string;
  end_date: string | null;
  tenant: Tenant;
}

interface Unit {
  id: number;
  unit_code: string;
  unit_name: string;
  status: 'available' | 'occupied';
  created_at: string;
  property: {
    id: number;
    name: string;
    address: string;
  };
  tenancies: {
    data: Tenancy[];
  };
}

interface UnitShowProps {
  unit: Unit;
}

export default function UnitShow({ unit }: UnitShowProps) {
  const getStatusVariant = (status: string): 'default' | 'secondary' => {
    return status === 'available' ? 'default' : 'secondary';
  };

  const getTenancyStatusVariant = (status: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
    switch (status) {
      case 'active':
        return 'default';
      case 'ended':
        return 'destructive';
      case 'pending':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <>
      <Head title={`Unit - ${unit.unit_name}`} />
      <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
          
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
                  <Home className="w-3 h-3" />
                  Unit Details
                </Badge>
                <Badge variant={getStatusVariant(unit.status)}>
                  {unit.status === 'available' ? 'Available' : 'Occupied'}
                </Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                {unit.unit_name}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Unit Code: {unit.unit_code}
              </p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Link href={route('landlord.properties.units', unit.property.id)}>
                <Button variant="outline" className="bg-card border-border/50 shadow-sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Property
                </Button>
              </Link>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-6">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Unit Information</CardTitle>
                  <CardDescription>
                    Basic information about this unit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Unit Name
                      </label>
                      <p className="font-medium">{unit.unit_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Unit Code
                      </label>
                      <p className="font-medium">{unit.unit_code}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Status
                      </label>
                      <div className="mt-1">
                        <Badge variant={getStatusVariant(unit.status)}>
                          {unit.status === 'available' ? 'Available' : 'Occupied'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Created
                      </label>
                      <p className="font-medium">{unit.created_at}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Tenancy History
                  </CardTitle>
                  <CardDescription>
                    Current and past tenancies for this unit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(unit.tenancies?.data || []).length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No tenancies yet</h3>
                      <p className="text-muted-foreground">
                        This unit has not been assigned to any tenants yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {unit.tenancies.data.map((tenancy) => (
                        <div
                          key={tenancy.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <Users className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{tenancy.tenant.full_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {tenancy.tenant.email}
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Start: {tenancy.start_date}
                                </div>
                                {tenancy.end_date && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    End: {tenancy.end_date}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge variant={getTenancyStatusVariant(tenancy.status)} className="capitalize">
                            {tenancy.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Property Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Property Name
                      </label>
                      <p className="font-medium">{unit.property.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Address
                      </label>
                      <p className="text-sm">{unit.property.address}</p>
                    </div>
                    <Link href={route('landlord.properties.units', unit.property.id)}>
                      <Button variant="outline" className="w-full">
                        View All Property Units
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {unit.status === 'available' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href={route('landlord.tenants.create')}>
                      <Button className="w-full">
                        <Users className="mr-2 h-4 w-4" />
                        Add Tenant
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          </div>
        </main>
    </>
  );
}

UnitShow.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
