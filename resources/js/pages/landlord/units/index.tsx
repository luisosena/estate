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
import { Building2, Home, Plus, Eye } from 'lucide-react';
import { route } from 'ziggy-js';

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

interface UnitsIndexProps {
  units: Unit[];
}

export default function UnitsIndex({ units }: UnitsIndexProps) {
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

  return (
    <SidebarProvider>
      <LandlordSidebar />
      <SidebarInset>
        <Head title="Units" />
        
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="text-sm font-medium">Units</span>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Units</h1>
              <p className="text-muted-foreground">
                Manage all your property units
              </p>
            </div>
            <Link href={route('landlord.units.create')}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Unit
              </Button>
            </Link>
          </div>

          {units.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No units yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Get started by adding your first unit to a property.
                </p>
                <Link href={route('landlord.units.create')}>
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
                <CardTitle>All Units</CardTitle>
                <CardDescription>
                  A complete list of all units across your properties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {units.map((unit) => (
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
                              Property: {unit.property.name}
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
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
