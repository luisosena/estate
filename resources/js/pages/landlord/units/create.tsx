import { Head, Link, useForm } from '@inertiajs/react';
import { Building2, Home, Plus } from 'lucide-react';
import { route } from 'ziggy-js';

import { LandlordSidebar } from '@/components/layout/landlord-sidebar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface Property {
  id: number;
  name: string;
  address: string;
}

interface CreateUnitProps {
  properties: Property[];
}

export default function CreateUnit({ properties }: CreateUnitProps) {
  const { data, setData, post, processing, errors, reset } = useForm({
    property_id: '',
    unit_code: '',
    unit_name: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('landlord.units.store'), {
      onSuccess: () => reset(),
    });
  };

  return (
    <SidebarProvider>
      <LandlordSidebar />
      <SidebarInset>
        <Head title="Create Unit" />
        
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="text-sm font-medium">Create Unit</span>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Create New Unit</h1>
              <p className="text-muted-foreground">
                Add a new unit to one of your properties
              </p>
            </div>
            <Link href={route('landlord.units.index')}>
              <Button variant="outline">
                <Building2 className="mr-2 h-4 w-4" />
                View All Units
              </Button>
            </Link>
          </div>

          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Unit Information</CardTitle>
              <CardDescription>
                Fill in the details for the new unit. All fields are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="property_id">Property</Label>
                  <Select onValueChange={(value) => setData('property_id', value)} value={data.property_id}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          <div>
                            <div className="font-medium">{property.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {property.address}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.property_id && (
                    <p className="text-sm text-destructive mt-1">{errors.property_id}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="unit_code">Unit Code</Label>
                    <Input
                      id="unit_code"
                      placeholder="e.g., A101, B-02, FLAT-1"
                      value={data.unit_code}
                      onChange={(e) => setData('unit_code', e.target.value)}
                    />
                    {errors.unit_code && (
                      <p className="text-sm text-destructive mt-1">{errors.unit_code}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="unit_name">Unit Name</Label>
                    <Input
                      id="unit_name"
                      placeholder="e.g., Apartment 101, Studio B"
                      value={data.unit_name}
                      onChange={(e) => setData('unit_name', e.target.value)}
                    />
                    {errors.unit_name && (
                      <p className="text-sm text-destructive mt-1">{errors.unit_name}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Link href={route('landlord.units.index')}>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={processing}>
                    <Plus className="mr-2 h-4 w-4" />
                    {processing ? 'Creating...' : 'Create Unit'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
