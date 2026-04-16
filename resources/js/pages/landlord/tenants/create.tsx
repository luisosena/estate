import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Users } from 'lucide-react';
import React from 'react';

import LandlordLayout from '@/components/layout/LandlordLayout';
import CreateTenantForm from '@/components/Tenant/CreateTenantForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';


interface AvailableUnit {
    id: number;
    unit_code: string;
    unit_name: string;
    property: {
        id: number;
        name: string;
        address: string;
    };
}

interface CreateTenantProps {
    availableUnits: AvailableUnit[];
    errors?: Record<string, string>;
    success?: string;
}

export default function CreateTenant({ availableUnits, errors, success }: CreateTenantProps) {
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
                                Add New Tenant
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Create a new tenant account and assign them to a unit
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                            <Link href="/landlord/tenants">
                                <Button variant="outline" className="bg-card border-border/50 shadow-sm hidden sm:flex">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Tenants
                                </Button>
                            </Link>
                        </div>
                    </header>

                    <div className="flex flex-1 flex-col gap-6">
                        <CreateTenantForm availableUnits={availableUnits} errors={errors} success={success} />
                    </div>
        </main>
    );
}

CreateTenant.layout = (page: React.ReactNode) => <LandlordLayout>{page}</LandlordLayout>;
