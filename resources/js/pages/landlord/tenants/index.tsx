import { LandlordSidebar } from '@/components/layout/landlord-sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Link, router } from '@inertiajs/react';
import { Building2, Mail, Phone, Users } from 'lucide-react';
import { route } from 'ziggy-js';

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

interface LandlordTenantsIndexProps {
    tenants: TenantRow[];
    properties: Property[];
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
}: LandlordTenantsIndexProps) {
    const handleLogout = () => {
        router.post('/logout');
    };

    const handleRemoveTenant = (tenancyId: number) => {
        if (confirm('Are you sure you want to remove this tenant? This will end their tenancy and make the unit available.')) {
            router.delete(route('landlord.tenants.remove', { tenancy: tenancyId }));
        }
    };

    return (
        <SidebarProvider defaultOpen={false}>
            <LandlordSidebar properties={properties} />
            <SidebarInset className="px-6 pt-4 pb-8">
                {/* Header */}
                <div className="mb-8 flex items-center gap-3">
                    <SidebarTrigger />
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">All Tenants</h1>
                        <p className="text-sm text-muted-foreground">
                            Showing all tenants across every property you own.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('landlord.tenants.create')}>
                                Add Tenant
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Summary stat */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Active Tenants
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {tenants.length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Across {properties.length} propert
                                {properties.length === 1 ? 'y' : 'ies'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Properties
                            </CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {properties.length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Owned properties
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                View by Property
                            </CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {properties.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">
                                        No properties found
                                    </p>
                                ) : (
                                    properties.map((p) => (
                                        <Link
                                            key={p.id}
                                            href={route(
                                                'landlord.properties.tenants',
                                                { property: p.id },
                                            )}
                                        >
                                            <Badge
                                                variant="outline"
                                                className="cursor-pointer hover:bg-muted"
                                            >
                                                {p.name}
                                            </Badge>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tenants table */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">
                            Tenant List
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {tenants.length === 0 ? (
                            <div className="py-12 text-center text-sm text-muted-foreground">
                                No active tenants found across your properties.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
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
                                                        <p className="font-medium">
                                                            {tenant.full_name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {tenant.tenant_code}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                                            <span>
                                                                {tenant.phone}
                                                            </span>
                                                        </div>
                                                        {tenant.email && (
                                                            <div className="flex items-center gap-1 text-xs">
                                                                <Mail className="h-3 w-3 text-muted-foreground" />
                                                                <span>
                                                                    {
                                                                        tenant.email
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Link
                                                        href={route(
                                                            'landlord.properties.tenants',
                                                            {
                                                                property:
                                                                    tenant.property_id,
                                                            },
                                                        )}
                                                        className="text-sm font-medium hover:underline"
                                                    >
                                                        {tenant.property_name}
                                                    </Link>
                                                    {tenant.property_address && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {
                                                                tenant.property_address
                                                            }
                                                        </p>
                                                    )}
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
                                                        >
                                                            View
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            className="text-xs"
                                                            onClick={() => handleRemoveTenant(tenant.tenancy_id)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </SidebarInset>
        </SidebarProvider>
    );
}
