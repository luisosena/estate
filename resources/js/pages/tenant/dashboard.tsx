import { LastPaymentsTable } from '@/components/last-payments-table';
import { TenantSidebar } from '@/components/tenant-sidebar';
import { Button } from '@/components/ui/button';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { UtilitiesTable } from '@/components/utilities-table';
import { Link, router } from '@inertiajs/react';
import { Bell, House, MessageCircleMore, SparkleIcon } from 'lucide-react';
import { route } from 'ziggy-js';

interface Payment {
    id: number;
    amount: number;
    payment_type: string;
    payment_method: string;
    paid_at: string | null;
    created_at: string;
}

interface Tenant {
    id: number;
    full_name: string;
}

interface TenantDashboardProps {
    tenant: Tenant;
    payments?: Payment[];
}

export default function TenantDashboard({
    payments = [],
    tenant = { id: 0, full_name: '' },
}: TenantDashboardProps) {
    const data = [
        { id: 1, header: 'Header 1', type: 'Type 1', status: 'Status 1' },
        { id: 2, header: 'Header 2', type: 'Type 2', status: 'Status 2' },
        { id: 3, header: 'Header 3', type: 'Type 3', status: 'Status 3' },
    ];

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <SidebarProvider defaultOpen={false}>
            <TenantSidebar />
            <SidebarInset className="pt-4 pr-8 pl-8">
                <div className="flex items-center">
                    <SidebarTrigger className="relative right-10 mr-4 ml-[-10px]" />
                    <span className="relative right-8.5 text-2xl font-bold">
                        Hello {tenant.full_name}!
                    </span>
                    <MessageCircleMore className="mr-4 ml-auto" />
                    <Bell />
                    <Button className="ml-4" onClick={handleLogout}>
                        Logout
                    </Button>
                    {/*
                        <Input placeholder="Enter text" className="w-50 h-7" />
                    */}
                </div>
                <div className="mt-8"></div>
                <div className="direction-row mt-5 flex h-28 gap-4">
                    <div className="flex-1 rounded-xl border border-gray-600 p-4">
                        <div className="flex-direction-row relative flex items-center gap-3">
                            <House color="gray" />
                            <span className="text-xl">Rent</span>
                        </div>
                    </div>
                    <div className="h-full flex-1 rounded-xl border border-gray-600 p-4">
                        <div className="flex-direction-row relative flex items-center gap-3">
                            <SparkleIcon color="gray" />
                            <span className="text-xl">Utilities</span>
                        </div>
                    </div>
                </div>
                {/*
                <div className="mt-30">
                    <span className="text-2xl font-bold">Utilities</span>
                    <div className="mt-4">
                        <Table05 />
                        <Table05 />
                    </div>
                </div>
                */}
                <div className="flex-direction-row mt-10 flex flex-wrap gap-8">
                    <div className="flex-3">
                        <span className="text-2xl font-bold">
                            Last Payments
                        </span>
                        <div className="mt-4">
                            <LastPaymentsTable payments={payments} />
                        </div>
                    </div>
                    <div className="flex-2">
                        <span className="text-2xl font-bold">Utilities</span>
                        <Link href={route('tenant.utilities')}>See All</Link>
                        <div className="mt-4">
                            <UtilitiesTable />
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
