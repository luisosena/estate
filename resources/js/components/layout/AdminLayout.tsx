import { usePage } from '@inertiajs/react';
import React from 'react';

import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { type SharedData } from '@/types';

interface AdminLayoutProps {
    children: React.ReactNode;
}

/**
 * Persistent layout for all Admin pages.
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
    const page = usePage<SharedData>();
    const { props } = page;
    
    // Admin specific shared data could be extracted here
    
    return (
        <SidebarProvider defaultOpen={true}>
            <AdminSidebar />
            <SidebarInset className="bg-slate-50/40 dark:bg-background h-screen overflow-y-auto">
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
