import { usePage } from '@inertiajs/react';
import React from 'react';

import { TenantSidebar } from '@/components/layout/tenant-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { type SharedData } from '@/types';

interface TenantLayoutProps {
    children: React.ReactNode;
}

/**
 * Persistent layout for all Tenant pages.
 *
 * This component mounts ONCE on login and stays alive for the entire session,
 * so the sidebar's open/closed state is preserved across page navigations.
 *
 * Usage in a page component:
 *
 *   import TenantLayout from '@/components/layout/TenantLayout';
 *
 *   export default function MyPage(props: Props) { ... }
 *   MyPage.layout = (page: React.ReactNode) => <TenantLayout>{page}</TenantLayout>;
 */
export default function TenantLayout({ children }: TenantLayoutProps) {
    // Pull shared data from Inertia's page props
    const page = usePage<SharedData>();
    const { props } = page;
    const unreadNotificationsCount = (props as any).unreadNotificationsCount ?? 0;

    return (
        <SidebarProvider defaultOpen={true}>
            <TenantSidebar unreadNotificationsCount={unreadNotificationsCount} />
            <SidebarInset className="bg-slate-50/40 dark:bg-background h-screen overflow-y-auto">
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
