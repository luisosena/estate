import { Link, router } from '@inertiajs/react';
import { Building2, Mail, Phone, Users, Filter, Home, TrendingUp, UserPlus } from 'lucide-react';
import React, { useState, useMemo } from 'react';

import LandlordLayout from '@/components/layout/LandlordLayout';
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

interface Metrics {
  total_tenants: number;
  total_properties: number;
  total_units: number;
  occupied_units: number;
  occupancy_rate: number;
}

interface LandlordTenantsIndexProps {
  tenants: TenantRow[];
  properties: Property[];
  selectedProperty: string;
  metrics: Metrics;
  propertyMetrics: Metrics | null;
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

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
  tenants = [],
  properties = [],
  selectedProperty,
  metrics,
  propertyMetrics,
}: LandlordTenantsIndexProps) {
  const [currentProperty, setCurrentProperty] = useState(selectedProperty);

  const handlePropertyChange = (value: string) => {
    setCurrentProperty(value);
    router.get(`/landlord/tenants`, { property: value }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleLogout = () => {
    router.post('/logout');
  };

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
      ? tenants.reduce((groups, tenant) => {
        const propertyName = tenant.property_name;
        if (!groups[propertyName]) {
          groups[propertyName] = [];
        }
        groups[propertyName].push(tenant);
        return groups;
      }, {} as Record<string, TenantRow[]>)
      : null;
  }, [currentProperty, tenants]);

  const PropertySeparator = () => (
    <div className="flex items-center justify-center py-4">
      <div className="border-t border-border/50 flex-1"></div>
      <div className="px-4 text-sm text-muted-foreground">•</div>
      <div className="border-t border-border/50 flex-1"></div>
    </div>
  );

  const currentMetrics = propertyMetrics || metrics;

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
                  ? 'Showing all tenants across every property you own.'
                  : `Showing tenants for ${properties.find(p => p.id.toString() === currentProperty)?.name}`
                }
              </p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
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
              <div className="text-2xl font-bold">{currentMetrics.total_tenants}</div>
              <p className="text-xs text-muted-foreground">
                Active tenants
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Properties</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMetrics.total_properties}</div>
              <p className="text-xs text-muted-foreground">Owned properties</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Units</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMetrics.total_units}</div>
              <p className="text-xs text-muted-foreground">Across properties</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupied Units</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMetrics.occupied_units}</div>
              <p className="text-xs text-muted-foreground">Currently occupied</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMetrics.occupancy_rate}%</div>
              <p className="text-xs text-muted-foreground">Of total units</p>
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
            </div>
          </CardContent>
        </Card>

        {/* Tenants table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              {currentProperty === 'all' ? 'All Tenants' : `Tenants - ${properties.find(p => p.id.toString() === currentProperty)?.name}`}
            </CardTitle>
            <CardDescription>
              {currentProperty === 'all' 
                ? 'All tenants across your properties, grouped by property'
                : `Tenants for the selected property`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {tenants.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {currentProperty === 'all' 
                  ? 'No active tenants found across your properties.'
                  : `No active tenants found for the selected property.`
                }
              </div>
            ) : (
              <div className="overflow-x-auto">
                {currentProperty === 'all' && groupedTenants ? (
                  <div className="space-y-6">
                    {Object.entries(groupedTenants).map(([propertyName, propertyTenants], index) => (
                      <div key={propertyName}>
                        <div className="mb-4 px-6">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            {propertyName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {propertyTenants.length} tenant{propertyTenants.length !== 1 ? 's' : ''}
                          </p>
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
                                      onClick={() =>
                                        router.visit(`/landlord/tenants/${tenant.tenant_code}`)
                                      }
                                    >
                                      View
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
                      {tenants.map((tenant) => (
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
                                onClick={() =>
                                  router.visit(`/landlord/tenants/${tenant.tenant_code}`)
                                }
                              >
                                View
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

LandlordTenantsIndex.layout = (page: React.ReactNode) => <LandlordLayout>{page}</LandlordLayout>;
