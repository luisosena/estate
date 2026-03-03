import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, router } from '@inertiajs/react';
import { Building, Edit, Home, Settings, Users, ArrowLeft, MapPin, Plus, Trash2 } from 'lucide-react';
import { route } from 'ziggy-js';

interface Landlord {
  id: number;
  name: string;
  tenant?: {
    id: number;
    full_name: string;
    phone?: string;
    email?: string;
  };
}

interface Unit {
  id: number;
  unit_name: string;
  unit_code: string;
  status: string;
  tenant?: {
    id: number;
    full_name: string;
  };
}

interface Property {
  id: number;
  landlord_id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  property_type: string;
  total_units: number;
  status: string;
  description: string;
  amenities: string[];
  policies: string[];
  landlord: Landlord;
  units: Unit[];
  created_at: string;
}

interface AdminPropertyShowProps {
  property: Property;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'inactive':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getPropertyTypeIcon = (type: string) => {
  switch (type) {
    case 'apartment':
      return <Building className="h-5 w-5" />;
    case 'house':
      return <Home className="h-5 w-5" />;
    case 'commercial':
      return <Settings className="h-5 w-5" />;
    case 'mixed':
      return <Users className="h-5 w-5" />;
    default:
      return <Building className="h-5 w-5" />;
  }
};

const getUnitStatusColor = (status: string) => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'occupied':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function AdminPropertyShow({ property }: AdminPropertyShowProps) {
  const deleteProperty = () => {
    if (confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      router.delete(route('admin.properties.destroy', property.id), {
        onSuccess: () => {
          // Property deleted successfully
        },
        onError: (errors) => {
          alert(errors.message || 'Failed to delete property');
        },
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href={route('admin.properties.index')}
                className="text-muted-foreground hover:text-foreground mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-semibold text-foreground">{property.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href={route('admin.properties.edit', property.id)}>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Property
                </Button>
              </Link>
              <Button variant="destructive" onClick={deleteProperty}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getPropertyTypeIcon(property.property_type)}
                  Property Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-foreground">Property Name</h3>
                    <p className="text-muted-foreground">{property.name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Status</h3>
                    <Badge className={getStatusColor(property.status)}>
                      {property.status}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Property Type</h3>
                    <p className="text-muted-foreground capitalize">{property.property_type}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Total Units</h3>
                    <p className="text-muted-foreground">{property.total_units}</p>
                  </div>
                </div>

                {property.description && (
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Description</h3>
                    <p className="text-muted-foreground">{property.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-foreground font-medium">{property.address}</p>
                  <p className="text-muted-foreground">
                    {property.city}, {property.state} {property.postal_code}
                  </p>
                  <p className="text-muted-foreground">{property.country}</p>
                </div>
              </CardContent>
            </Card>

            {/* Units */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Units</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {property.units.length} of {property.total_units} units
                  </span>
                </CardTitle>
                <CardDescription>
                  Overview of all units in this property
                </CardDescription>
              </CardHeader>
              <CardContent>
                {property.units.length === 0 ? (
                  <div className="text-center py-8">
                    <Building className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p className="text-muted-foreground">No units found</p>
                    <p className="text-sm text-muted-foreground">Add units to this property to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {property.units.map((unit) => (
                      <div
                        key={unit.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <h4 className="font-medium">{unit.unit_name}</h4>
                          <p className="text-sm text-muted-foreground">{unit.unit_code}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getUnitStatusColor(unit.status)}>
                              {unit.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Policies */}
            {property.policies && property.policies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Policies</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {property.policies.map((policy, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-muted-foreground mt-1">•</span>
                        <span className="text-muted-foreground">{policy}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Landlord Info */}
            <Card>
              <CardHeader>
                <CardTitle>Landlord</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium">{property.landlord.name}</h3>
                    <p className="text-sm text-muted-foreground">{property.landlord.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Units</span>
                  <span>{property.total_units}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(property.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Occupied Units</span>
                  <span>{property.units.filter(u => u.status === 'occupied').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available Units</span>
                  <span>{property.units.filter(u => u.status === 'available').length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={route('admin.properties.edit', property.id)} className="w-full">
                  <Button className="w-full">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Property
                  </Button>
                </Link>
                <Button variant="destructive" onClick={deleteProperty} className="w-full mt-2">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Property
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
