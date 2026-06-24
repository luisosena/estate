import { usePage } from '@inertiajs/react';
import React from 'react';

import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { type BreadcrumbItem, type SharedData } from '@/types';

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

/**
 * Canonical Application Layout (Design System v2.0 — Linear-Inspired).
 *
 * - Flat 240px sidebar with 1px right border (no inset, no shadow).
 * - Sticky h-14 top bar with breadcrumb, search, user menu, mode toggle.
 * - Content area: p-6 (desktop) / p-4 (mobile), max-w-7xl centered.
 *
 * Used by every authenticated page via:
 *     Page.layout = (page) => <AppLayout>{page}</AppLayout>
 */
export default function AppLayout({ children, breadcrumbs = [] }: AppLayoutProps) {
    const { props } = usePage<SharedData>();
    const user = props.auth?.user;

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                {children}
            </div>
        );
    }

    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar />

            <SidebarInset className="flex h-svh min-h-0 flex-col bg-background">
                {/* Mobile-only sidebar trigger (top-left of canvas) */}
                <div className="absolute left-3 top-3 z-40 md:hidden">
                    <SidebarTrigger className="h-9 w-9 rounded-md border border-border bg-card shadow-sm" />
                </div>

                <AppHeader breadcrumbs={breadcrumbs} />

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
                        {children}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}