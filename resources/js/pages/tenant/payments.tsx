interface Tenant {
    id: number;
    full_name: string;
    phone: number;
    email: string;
}

interface Payment {
    id: number;
    amount: number;
    payment_type: string;
    payment_method: string;
    paid_at: string | null;
    created_at: string;
}

interface TenantPaymentProp {
    tenant: Tenant;
    payments?: Payment;
}

export default function TenantPayments({
    tenant,
    payments,
}: TenantPaymentProp) {
    return <div>{tenant.full_name}</div>;
}
