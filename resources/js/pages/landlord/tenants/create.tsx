import { Head } from '@inertiajs/react';
import AuthLayout from '@/layouts/auth-layout';
import CreateTenantForm from '@/components/Tenant/CreateTenantForm';

interface CreateTenantProps {
    errors?: Record<string, string>;
    success?: string;
}

export default function CreateTenant({ errors, success }: CreateTenantProps) {
    return (
        <AuthLayout title="Add New Tenant" description="Create a new tenant account">
            <Head title="Add New Tenant" />
            <CreateTenantForm errors={errors} success={success} />
        </AuthLayout>
    );
}
