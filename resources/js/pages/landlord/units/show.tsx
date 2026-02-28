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
import { Badge } from '@/components/ui/badge';
import { Head, Link } from '@inertiajs/react';
import { Building2, Home, Users, Calendar, ArrowLeft } from 'lucide-react';
import { route } from 'ziggy-js';

interface Tenant {
  id: string;
  name: string;
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
  tenancies: Tenancy[];
}

interface UnitShowProps {
  unit: Unit;
}

export default function UnitShow({ unit }: UnitShowProps) {
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

  const getTenancyStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <SidebarProvider>
      <LandlordSidebar />
      <SidebarInset>
        <Head title={`Unit - ${unit.unit_name}`} />
        
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="text-sm font-medium">Unit Details</span>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={route('landlord.properties.units', unit.property.id)}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Property Units
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{unit.unit_name}</h1>
                <p className="text-muted-foreground">
                  Unit Code: {unit.unit_code}
                </p>
              </div>
            </div>
            {getStatusBadge(unit.status)}
          </div>

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
                      <div className="mt-1">{getStatusBadge(unit.status)}</div>
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
                  {unit.tenancies.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No tenancies yet</h3>
                      <p className="text-muted-foreground">
                        This unit has not been assigned to any tenants yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {unit.tenancies.map((tenancy) => (
                        <div
                          key={tenancy.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <Users className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{tenancy.tenant.name}</div>
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
                          {getTenancyStatusBadge(tenancy.status)}
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
      </SidebarInset>
    </SidebarProvider>
  );
}
