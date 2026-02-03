import Table05 from '@/components/table-05';
import { TenantSidebar } from '@/components/tenant-sidebar';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { router } from '@inertiajs/react';
import { Bell, MessageCircleMore } from 'lucide-react';
import { Button } from 'node_modules/@headlessui/react/dist/components/button/button';

export default function TenantDashboard() {
    const data = [
        { id: 1, header: 'Header 1', type: 'Type 1', status: 'Status 1' },
        { id: 2, header: 'Header 2', type: 'Type 2', status: 'Status 2' },
        { id: 3, header: 'Header 3', type: 'Type 3', status: 'Status 3' },
    ];

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <SidebarProvider>
            <TenantSidebar />
            <SidebarInset>
                <div className="p-4">
                    <div className="flex items-center">
                        <SidebarTrigger className="mr-4 ml-[-10px]" />
                        <span className="text-2xl font-bold">
                            Tenant Dashboard
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
                    <div className="direction-row mt-12 flex h-28 gap-4">
                        <div className="h-full flex-1 rounded-xl bg-white"></div>
                        <div className="h-full flex-1 rounded-xl bg-green-500"></div>
                        <div className="h-full flex-1 rounded-xl bg-red-500"></div>
                    </div>
                    <div></div>
                    <div className="mt-65">
                        <span className="border-b-2 border-gray-200 text-2xl font-bold">
                            Utilities
                        </span>
                        <div className="mt-4">
                            <Table05 />
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
