import { Link, router, useForm } from '@inertiajs/react';
import { Building, Home, Plus, Search, Users, Eye, Edit, Trash2, ToggleLeft, ToggleRight, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface Landlord {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  email_verified_at: string | null;
  created_at: string;
  properties_count?: number;
}

interface AdminUsersIndexProps {
  landlords: {
    data: Landlord[];
    links: [];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
  stats: {
    total_landlords: number;
    active_landlords: number;
    inactive_landlords: number;
    total_properties: number;
  };
  filters: {
    search: string;
    status: string;
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

export default function AdminUsers({ landlords, stats, filters }: AdminUsersIndexProps) {
  const [localFilters, setLocalFilters] = useState({
    search: filters?.search || '',
    status: filters?.status || 'all'
  });
  
  // Ensure landlords has default structure
  const safeLandlords = landlords || {
    data: [],
    links: [],
    meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 }
  };

  // Ensure meta exists
  const meta = safeLandlords.meta || { current_page: 1, last_page: 1, per_page: 10, total: 0 };
  const links = safeLandlords.links || [];

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    
    const params = new URLSearchParams();
    if (newFilters.search) params.append('search', newFilters.search);
    if (newFilters.status !== 'all') params.append('status', newFilters.status);
    
    router.get('/admin/users', Object.fromEntries(params), {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const toggleStatus = (landlordId: number) => {
    router.post(`/admin/users/${landlordId}/toggle-status`, {}, {
      onSuccess: () => {
        // Status updated successfully
      },
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
                href={route('admin.dashboard')}
                className="text-muted-foreground hover:text-foreground mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
              <h1 className="text-xl font-semibold">Landlord Management</h1>
            </div>
            <Link href={route('admin.users.create')}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Landlord
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Landlords</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_landlords}</div>
              <p className="text-xs text-muted-foreground">Registered landlords</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Landlords</CardTitle>
              <ToggleRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_landlords}</div>
              <p className="text-xs text-muted-foreground">Verified accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Landlords</CardTitle>
              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactive_landlords}</div>
              <p className="text-xs text-muted-foreground">Unverified accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_properties}</div>
              <p className="text-xs text-muted-foreground">Across all landlords</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Input
                    placeholder="Search landlords..."
                    value={localFilters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pr-8"
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
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Landlords List */}
        <Card>
          <CardHeader>
            <CardTitle>Landlords</CardTitle>
            <CardDescription>Manage all registered landlords</CardDescription>
          </CardHeader>
          <CardContent>
            {safeLandlords.data.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No landlords found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {localFilters.search || localFilters.status !== 'all'
                    ? "No landlords match your search criteria."
                    : "Get started by adding your first landlord."
                  }
                </p>
                <Link href={route('admin.users.create')}>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Landlord
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {safeLandlords.data.map((landlord) => (
                  <div
                    key={landlord.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{landlord.name}</div>
                          <div className="text-sm text-muted-foreground">
                            @{landlord.username} • {landlord.email}
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Home className="h-3 w-3 mr-1" />
                              {landlord.properties_count || 0} properties
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(landlord.email_verified_at ? 'active' : 'inactive')}>
                        {landlord.email_verified_at ? 'Active' : 'Inactive'}
                      </Badge>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatus(landlord.id)}
                      >
                        {landlord.email_verified_at ? (
                          <ToggleLeft className="h-4 w-4" />
                        ) : (
                          <ToggleRight className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Link href={route('admin.users.show', landlord.id)}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      
                      <Link href={route('admin.users.edit', landlord.id)}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((meta.current_page - 1) * meta.per_page) + 1} to{' '}
              {Math.min(meta.current_page * meta.per_page, meta.total)} of{' '}
              {meta.total} results
            </div>
            <div className="flex items-center space-x-2">
              {links.map((link: any, index: number) => (
                <Link
                  key={index}
                  href={link.url || '#'}
                  className={`px-3 py-1 text-sm rounded-md ${
                    link.active
                      ? 'bg-primary text-primary-foreground'
                      : link.url
                      ? 'bg-muted hover:bg-muted/80'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
