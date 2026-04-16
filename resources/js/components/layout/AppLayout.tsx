import { usePage } from '@inertiajs/react';
import React from 'react';

import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { type SharedData } from '@/types';

interface AppLayoutProps {
    children: React.ReactNode;
}

/**
 * Universal Persistent Layout for Admin, Landlord, and Tenant portals.
 * Standardizes the "Sheet" sidebar experience across all user roles.
 */
export default function AppLayout({ children }: AppLayoutProps) {
    const { props } = usePage<SharedData>();
    const user = props.auth?.user;
    
    // Safety check for unauthenticated access to layouts
    if (!user) {
        return <div className="min-h-screen bg-background flex items-center justify-center p-4">{children}</div>;
    }

    return (
        <SidebarProvider defaultOpen={true}>
            {/* Unified Role-Aware Sidebar */}
            <AppSidebar />
            
            {/* Main Application Canvas */}
            <SidebarInset className="bg-slate-50/40 dark:bg-background h-screen flex flex-col overflow-hidden relative">
                
                {/* Global Mobile/Icon-mode Sidebar Trigger */}
                <div className="absolute top-6 left-4 z-50 md:hidden">
                    <SidebarTrigger className="h-9 w-9 shadow-md bg-background border border-border/50 rounded-lg" />
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                    {children}
                </div>
                
                {/* Optional: Global Flash Notifications could be rendered here */}
            </SidebarInset>
        </SidebarProvider>
    );
}
