import { Head } from '@inertiajs/react';

import CreateTenantForm from '@/components/Tenant/CreateTenantForm';
import AuthLayout from '@/layouts/auth-layout';

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
        <AuthLayout title="Add New Tenant" description="Create a new tenant account">
            <Head title="Add New Tenant" />
            <CreateTenantForm availableUnits={availableUnits} errors={errors} success={success} />
        </AuthLayout>
    );
}
