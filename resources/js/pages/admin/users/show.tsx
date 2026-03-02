import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Building, Home, Users, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { route } from 'ziggy-js';

interface Property {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  total_units: number;
  status: string;
  created_at: string;
}

interface Landlord {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  email_verified_at: string | null;
  created_at: string;
  properties: Property[];
}

interface AdminUserShowProps {
  landlord: Landlord;
  stats: {
    total_properties: number;
    total_units: number;
    occupied_units: number;
    active_tenancies: number;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'inactive':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getPropertyStatusColor = (status: string) => {
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

export default function AdminUserShow({ landlord, stats }: AdminUserShowProps) {
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this landlord? This action cannot be undone.')) {
      router.delete(`/admin/users/${landlord.id}`);
    }
  };

  const toggleStatus = () => {
    router.post(`/admin/users/${landlord.id}/toggle-status`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href={route('admin.users.index')}
                className="text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Landlords
              </Link>
              <h1 className="text-xl font-semibold">{landlord.name}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={toggleStatus}
              >
                {landlord.email_verified_at ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>
              <Link href={route('admin.users.edit', landlord.id)}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Landlord Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Landlord Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-lg">{landlord.name}</div>
                    <div className="text-sm text-muted-foreground">@{landlord.username}</div>
                    <Badge className={getStatusColor(landlord.email_verified_at ? 'active' : 'inactive')}>
                      {landlord.email_verified_at ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    {landlord.email}
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    Joined {new Date(landlord.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Properties</span>
                  </div>
                  <span className="font-medium">{stats.total_properties}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Total Units</span>
                  </div>
                  <span className="font-medium">{stats.total_units}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Occupied Units</span>
                  </div>
                  <span className="font-medium">{stats.occupied_units}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Active Tenancies</span>
                  </div>
                  <span className="font-medium">{stats.active_tenancies}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Properties */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Properties</CardTitle>
                <CardDescription>
                  Properties owned by {landlord.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {landlord.properties.length === 0 ? (
                  <div className="text-center py-12">
                    <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Properties</h3>
                    <p className="text-muted-foreground mb-4">
                      This landlord doesn't own any properties yet.
                    </p>
                    <Link href={route('admin.properties.create')}>
                      <Button>
                        Add Property
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {landlord.properties.map((property) => (
                      <div
                        key={property.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{property.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {property.address}, {property.city}, {property.state}
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Home className="h-3 w-3 mr-1" />
                                {property.total_units} units
                              </div>
                              <Badge className={getPropertyStatusColor(property.status)}>
                                {property.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <Link href={route('admin.properties.show', property.id)}>
                          <Button variant="outline" size="sm">
                            View Property
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
