interface Tenant {
    id: number;
    full_name: string;
}

interface TenantUtilitiesProps {
    tenant: Tenant;
}

export default function TenantUtilities({ tenant }: TenantUtilitiesProps) {
    return (
        <div>
            <div>Utilities</div>
            <span>{tenant.id}</span>
        </div>
    );
}
