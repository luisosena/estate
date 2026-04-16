import React from 'react';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Building2, Mail, Phone, Users } from 'lucide-react';
import { route } from 'ziggy-js';

import LandlordLayout from '@/components/layout/LandlordLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import type { TenantRow } from './index';

interface PropertyInfo {
    id: number;
    name: string;
    address: string | null;
}

interface Property {
    id: number;
    name: string;
    address?: string | null;
}

interface LandlordTenantsByPropertyProps {
    tenants: TenantRow[];
    property: PropertyInfo;
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

export default function LandlordTenantsByProperty({
    tenants = [],
    property,
    properties = [],
}: LandlordTenantsByPropertyProps) {
    const handleLogout = () => {
        router.post('/logout');
    };

    const handleRemoveTenant = (tenancyId: number) => {
        if (confirm('Are you sure you want to remove this tenant? This will end their tenancy and make the unit available.')) {
            router.delete(route('landlord.tenants.remove', { tenancy: tenancyId }));
        }
    };

    // Group tenants by unit for a cleaner breakdown
    const unitGroups = tenants.reduce<Record<string, TenantRow[]>>(
        (acc, tenant) => {
            const key = tenant.unit_code;
            if (!acc[key]) acc[key] = [];
            acc[key].push(tenant);
            return acc;
        },
        {},
    );

    return (
        <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
                    
                    {/* Header */}
                    <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
                                    <Building2 className="w-3 h-3" />
                                    Property Tenants
                                </Badge>
                            </div>
                            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                                {property.name}
                            </h1>
                            {property.address && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {property.address}
                                </p>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                            <Link href={route('landlord.tenants.index')}>
                                <Button variant="outline" className="bg-card border-border/50 shadow-sm hidden sm:flex">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    All Tenants
                                </Button>
                            </Link>
                            <Link href={route('landlord.tenants.create')}>
                                <Button className="shadow-sm">
                                    Add Tenant
                                </Button>
                            </Link>
                        </div>
                    </header>

                    <div className="flex flex-1 flex-col gap-6">

                {/* Summary stats */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Tenants
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {tenants.length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                In {Object.keys(unitGroups).length} occupied
                                unit
                                {Object.keys(unitGroups).length === 1
                                    ? ''
                                    : 's'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Property
                            </CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="truncate text-lg font-bold">
                                {property.name}
                            </div>
                            <p className="truncate text-xs text-muted-foreground">
                                {property.address ?? 'No address on record'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tenants table */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">
                            Tenants in {property.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {tenants.length === 0 ? (
                            <div className="py-12 text-center text-sm text-muted-foreground">
                                No active tenants found in this property.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
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
                                                            onClick={() => router.visit(route('tenant.dashboard.show', { tenant: tenant.id }))}
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

                {/* Unit breakdown */}
                {Object.keys(unitGroups).length > 1 && (
                    <div className="mt-6">
                        <h2 className="mb-3 text-base font-semibold">
                            Breakdown by Unit
                        </h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(unitGroups).map(
                                ([unitCode, unitTenants]) => (
                                    <Card key={unitCode}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">
                                                {unitTenants[0].unit_name}
                                            </CardTitle>
                                            <p className="text-xs text-muted-foreground">
                                                {unitCode}
                                            </p>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {unitTenants.map((t) => (
                                                    <div
                                                        key={t.tenant_code}
                                                        className="flex items-center justify-between"
                                                    >
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {t.full_name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {t.tenant_code}
                                                            </p>
                                                        </div>
                                                        <Badge
                                                            variant={tenancyStatusVariant(
                                                                t.tenancy_status,
                                                            )}
                                                            className="text-xs"
                                                        >
                                                            {t.tenancy_status}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ),
                            )}
                        </div>
                    </div>
                )}
                </div>
        </main>
    );
}

LandlordTenantsByProperty.layout = (page: React.ReactNode) => <LandlordLayout>{page}</LandlordLayout>;
