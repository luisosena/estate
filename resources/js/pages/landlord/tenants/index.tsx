import { Link, router } from '@inertiajs/react';
import { Building2, Mail, Phone, Users, Filter, Home, TrendingUp, UserPlus, Upload, Search } from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import Pagination from '@/components/shared/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import CsvImportController from '@/actions/App/Http/Controllers/Web/Landlord/CsvImportController';
import { Input } from '@/components/ui/input';

export interface TenantRow {
  id: number;
  tenant_code: string;
  full_name: string;
  phone: string;
  email: string | null;
  tenancy_id: number;
  tenancy_status: string;
  unit_name: string;
  unit_code: string;
  property_id: number;
  property_name: string;
  property_address: string | null;
}

interface Property {
  id: number;
  name: string;
  address?: string | null;
}

interface Stats {
  total_tenants: number;
  total_properties: number;
  total_units: number;
  occupied_units: number;
}

interface LandlordTenantsIndexProps {
  tenants: {
    data: TenantRow[];
    links: any[];
    meta: {
      current_page: number;
      last_page: number;
      total: number;
      links: Array<{
        url: string | null;
        label: string;
        active: boolean;
      }>;
    };
  };
  properties: Property[];
  stats: Stats;
  filters: {
    property: string;
    search: string;
  };
}

const tenancyStatusVariant = (
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'default';
    case 'ended':
      return 'secondary';
    default:
      return 'outline';
  }
};

export default function LandlordTenantsIndex({
  tenants,
  properties = [],
  stats,
  filters,
}: LandlordTenantsIndexProps) {
  const [currentProperty, setCurrentProperty] = useState(filters?.property || 'all');
  const [searchQuery, setSearchQuery] = useState(filters?.search || '');
  const { data: tenantList, meta } = tenants;
  const links = meta.links;

  const handlePropertyChange = (value: string) => {
    setCurrentProperty(value);
    router.get(`/landlord/tenants`, {
      property: value === 'all' ? undefined : value,
      search: searchQuery || undefined,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.get('/landlord/tenants', {
        search: searchQuery || undefined,
        property: currentProperty === 'all' ? undefined : currentProperty,
      }, {
        preserveState: true,
        preserveScroll: true,
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleRemoveTenant = (tenancyId: number) => {
    if (
      confirm(
        'Are you sure you want to remove this tenant? This will end their tenancy and make the unit available.',
      )
    ) {
      router.delete(`/landlord/tenants/${tenancyId}/remove`);
    }
  };

  // Group tenants by property when "all" is selected
  const groupedTenants = useMemo(() => {
    return currentProperty === 'all' 
      ? tenantList.reduce((groups, tenant) => {
        const propertyName = tenant.property_name;
        if (!groups[propertyName]) {
          groups[propertyName] = [];
        }
        groups[propertyName].push(tenant);
        return groups;
      }, {} as Record<string, TenantRow[]>)
      : null;
  }, [currentProperty, tenantList]);

  const PropertySeparator = () => (
    <div className="flex items-center justify-center py-4">
      <div className="border-t border-border/50 flex-1"></div>
      <div className="px-4 text-sm text-muted-foreground">•</div>
      <div className="border-t border-border/50 flex-1"></div>
    </div>
  );

  const occupancyRate = stats.total_units > 0 
    ? Math.round((stats.occupied_units / stats.total_units) * 100) 
    : 0;

  return (
    <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
          
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
                  <Users className="w-3 h-3" />
                  Tenants Record
                </Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                All Tenants
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {currentProperty === 'all' 
                  ? 'Showing all active tenants across every property you own.'
                  : `Showing tenants for ${properties.find(p => p.id.toString() === currentProperty)?.name}`
                }
              </p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Link href={CsvImportController.index().url}>
                <Button variant="outline" className="bg-card border-border/50 shadow-sm hidden sm:flex">
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Import
                </Button>
              </Link>
              <Link href="/landlord/tenants/create">
                <Button className="shadow-sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Tenant
                </Button>
              </Link>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Tenants
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_tenants}</div>
              <p className="text-xs text-muted-foreground">
                Active tenancies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Properties</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_properties}</div>
              <p className="text-xs text-muted-foreground">Owned buildings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Units</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_units}</div>
              <p className="text-xs text-muted-foreground">Portfolio capacity</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupied Units</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.occupied_units}</div>
              <p className="text-xs text-muted-foreground">Currently filled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{occupancyRate}%</div>
              <p className="text-xs text-muted-foreground">Of capacity</p>
            </CardContent>
          </Card>
        </div>

        {/* Property Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Filter by Property:</span>
                <Select value={currentProperty} onValueChange={handlePropertyChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative ml-auto w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tenants, units..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tenants table */}
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-semibold">
              {currentProperty === 'all' ? 'All Tenants' : `Tenants - ${properties.find(p => p.id.toString() === currentProperty)?.name}`}
            </CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span>
                {currentProperty === 'all' 
                  ? 'All tenants across your properties, grouped by property'
                  : `Tenants for the selected property`
                }
              </span>
              <span className="text-xs font-medium">
                Showing {tenantList.length} of {tenants.meta.total} records
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {tenantList.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {currentProperty === 'all' 
                  ? 'No active tenants found across your properties.'
                  : `No active tenants found for the selected property.`
                }
              </div>
            ) : (
              <div className="overflow-x-auto flex flex-col">
                {currentProperty === 'all' && groupedTenants ? (
                  <div className="space-y-6 pt-6">
                    {Object.entries(groupedTenants).map(([propertyName, propertyTenants], index) => (
                      <div key={propertyName}>
                        <div className="mb-4 px-6 underline underline-offset-4 decoration-primary/20">
                          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            {propertyName}
                          </h3>
                        </div>
                        
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tenant</TableHead>
                              <TableHead>Contact</TableHead>
                              <TableHead>Unit</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {propertyTenants.map((tenant) => (
                              <TableRow key={tenant.tenant_code}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{tenant.full_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {tenant.tenant_code}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-xs">
                                      <Phone className="h-3 w-3 text-muted-foreground" />
                                      <span>{tenant.phone}</span>
                                    </div>
                                    {tenant.email && (
                                      <div className="flex items-center gap-1 text-xs">
                                        <Mail className="h-3 w-3 text-muted-foreground" />
                                        <span>{tenant.email}</span>
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {tenant.unit_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {tenant.unit_code}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={tenancyStatusVariant(
                                      tenant.tenancy_status,
                                    )}
                                  >
                                    {tenant.tenancy_status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-xs"
                                      asChild
                                    >
                                        <Link href={`/landlord/tenants/${tenant.tenant_code}`}>
                                            View
                                        </Link>
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="text-xs"
                                      onClick={() =>
                                        handleRemoveTenant(tenant.tenancy_id)
                                      }
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        
                        {index < Object.entries(groupedTenants).length - 1 && <PropertySeparator />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tenantList.map((tenant) => (
                        <TableRow key={tenant.tenant_code}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{tenant.full_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {tenant.tenant_code}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-xs">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span>{tenant.phone}</span>
                              </div>
                              {tenant.email && (
                                <div className="flex items-center gap-1 text-xs">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  <span>{tenant.email}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">
                                {tenant.property_name}
                              </p>
                              {tenant.property_address && (
                                <p className="text-xs text-muted-foreground">
                                  {tenant.property_address}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">
                                {tenant.unit_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {tenant.unit_code}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={tenancyStatusVariant(
                                tenant.tenancy_status,
                              )}
                            >
                              {tenant.tenancy_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    asChild
                                >
                                    <Link href={`/landlord/tenants/${tenant.tenant_code}`}>
                                        View
                                    </Link>
                                </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="text-xs"
                                onClick={() =>
                                  handleRemoveTenant(tenant.tenancy_id)
                                }
                              >
                                Remove
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                
                {/* Pagination */}
                <div className="p-4 border-t bg-muted/30">
                    <Pagination links={links} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

LandlordTenantsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
