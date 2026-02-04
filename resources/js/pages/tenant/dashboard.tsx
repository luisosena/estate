import Table05 from '@/components/table-05';
import { TenantSidebar } from '@/components/tenant-sidebar';
import { Button } from '@/components/ui/button';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { router } from '@inertiajs/react';
import { Bell, MessageCircleMore } from 'lucide-react';

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
                        <span className="text-2xl font-bold">Hello Dan!</span>
                        <MessageCircleMore className="mr-4 ml-auto" />
                        <Bell />
                        <Button className="ml-4" onClick={handleLogout}>
                            Logout
                        </Button>
                        {/*
          <Input placeholder="Enter text" className="w-50 h-7" />
          */}
                    </div>
                    <div className="mt-12">
                        <span className="text-2xl font-bold">Overview</span>
                    </div>
                    <div className="direction-row mt-8 flex h-28 gap-4">
                        <div className="h-full flex-1 rounded-xl border border-gray-600 p-4">
                            <span className="text-xl">Rent</span>
                        </div>
                        <div className="h-full flex-1 rounded-xl border border-gray-600 p-4">
                            <span className="text-xl">Utilities</span>
                        </div>
                    </div>
                    <div></div>
                    <div className="mt-30">
                        <span className="text-2xl font-bold">Utilities</span>
                        <div className="mt-4">
                            <Table05 />
                            <Table05 />
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
