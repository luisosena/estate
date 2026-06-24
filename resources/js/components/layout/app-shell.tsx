import { usePage } from '@inertiajs/react';
import React from 'react';

import { SidebarProvider } from '@/components/ui/sidebar';
import { SharedData } from '@/types';

interface AppShellProps {
    children: React.ReactNode;
}

/**
 * @deprecated Use `<AppLayout />` from `@/components/layout/AppLayout` directly.
 * Kept as a backwards-compatible sidebar shell for older imports.
 */
export function AppShell({ children }: AppShellProps) {
    const isOpen = usePage<SharedData>().props.sidebarOpen;

    return <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>;
}