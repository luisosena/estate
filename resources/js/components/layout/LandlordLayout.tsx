import { usePage } from '@inertiajs/react';
import React from 'react';

import { LandlordSidebar } from '@/components/layout/landlord-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { type SharedData } from '@/types';

interface LandlordLayoutProps {
    children: React.ReactNode;
}

/**
 * Persistent layout for all Landlord pages.
 *
 * This component mounts ONCE on login and stays alive for the entire session,
 * so the sidebar's open/closed state is preserved across page navigations via
 * React's in-memory state (no cookies needed).
 *
 * Usage in a page component:
 *
 *   import LandlordLayout from '@/components/layout/LandlordLayout';
 *
 *   export default function MyPage(props: Props) { ... }
 *   MyPage.layout = (page: React.ReactNode) => <LandlordLayout>{page}</LandlordLayout>;
 */
export default function LandlordLayout({ children }: LandlordLayoutProps) {
    const page = usePage<SharedData & { unreadNotificationsCount?: number; properties?: { id: number; name: string }[] }>();
    const { unreadNotificationsCount = 0, properties = [] } = page.props as any;

    return (
        <SidebarProvider defaultOpen={true}>
            <LandlordSidebar
                properties={properties}
                unreadNotificationsCount={unreadNotificationsCount}
            />
            <SidebarInset className="bg-slate-50/40 dark:bg-background h-screen overflow-y-auto">
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
