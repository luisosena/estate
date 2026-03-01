import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, router } from '@inertiajs/react';
import { Building, Edit, Eye, Plus, Search, Trash2, Home, Users, Settings } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState } from 'react';

interface Landlord {
  id: number;
  name: string;
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
  property_type: string;
  total_units: number;
  status: string;
  landlord: Landlord;
  created_at: string;
}

interface AdminPropertiesProps {
  properties: {
    data: Property[];
    links: any[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
  landlords: Landlord[];
  filters: {
    search: string;
    status: string;
    landlord_id: string;
  };
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
      return <Building className="h-4 w-4" />;
    case 'house':
      return <Home className="h-4 w-4" />;
    case 'commercial':
      return <Settings className="h-4 w-4" />;
    case 'mixed':
      return <Users className="h-4 w-4" />;
    default:
      return <Building className="h-4 w-4" />;
  }
};

export default function AdminProperties({ properties, landlords, filters }: AdminPropertiesProps) {
  const [localFilters, setLocalFilters] = useState({
    search: filters?.search || '',
    status: filters?.status || 'all',
    landlord_id: filters?.landlord_id || 'all'
  });
  
  // Ensure properties has default structure
  const safeProperties = properties || {
    data: [],
    links: [],
    meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    
    router.get(route('admin.properties.index'), newFilters, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleSearch = (value: string) => {
    setLocalFilters({ ...localFilters, search: value });
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      router.get(route('admin.properties.index'), { ...localFilters, search: value }, {
        preserveState: true,
        preserveScroll: true,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const deleteProperty = (id: number) => {
    if (confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      router.delete(route('admin.properties.destroy', id), {
        onSuccess: () => {
          // Property deleted successfully
        },
        onError: (errors) => {
          alert(errors.message || 'Failed to delete property');
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href={route('admin.dashboard')}
                className="text-gray-600 hover:text-gray-900 mr-4"
              >
                <Home className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Properties</h1>
            </div>
            <Link href={route('admin.properties.create')}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <Input
                  placeholder="Search properties..."
                  value={localFilters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={localFilters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              <Select value={localFilters.landlord_id} onValueChange={(value) => handleFilterChange('landlord_id', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Landlord" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Landlords</SelectItem>
                  {landlords.map((landlord) => (
                    <SelectItem key={landlord.id} value={landlord.id.toString()}>
                      {landlord.tenant?.full_name || landlord.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Properties List */}
        <Card>
          <CardHeader>
            <CardTitle>All Properties</CardTitle>
            <CardDescription>
              {safeProperties?.meta?.total || 0} propert{(safeProperties?.meta?.total || 0) !== 1 ? 'ies' : 'y'} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(!safeProperties?.data || safeProperties.data.length === 0) ? (
              <div className="py-12 text-center text-muted-foreground">
                <Building className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No properties found</p>
                <p className="text-sm">Get started by adding your first property</p>
                <Link href={route('admin.properties.create')} className="mt-4 inline-block">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Property
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {safeProperties?.data?.map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">
                        {getPropertyTypeIcon(property.property_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{property.name}</h3>
                          <Badge className={getStatusColor(property.status)}>
                            {property.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {property.address}, {property.city}, {property.state}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{property.total_units} units</span>
                          <span>{property.property_type}</span>
                          <span>Landlord: {property.landlord?.tenant?.full_name || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Link href={route('admin.properties.show', property.id)}>
                        <Button variant="ghost" size="sm" title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={route('admin.properties.edit', property.id)}>
                        <Button variant="ghost" size="sm" title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => deleteProperty(property.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {safeProperties?.links && safeProperties.links.length > 3 && (
              <div className="mt-6 flex justify-center">
                <div className="flex gap-1">
                  {safeProperties.links.map((link: any, index: number) => (
                    <Link
                      key={index}
                      href={link.url || '#'}
                      className={`px-3 py-2 text-sm rounded ${
                        link.active
                          ? 'bg-primary text-primary-foreground'
                          : link.url
                          ? 'bg-muted hover:bg-muted/80'
                          : 'bg-muted/50 text-muted cursor-not-allowed'
                      }`}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
