import { usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';

import AppLayoutTemplate from '@/components/layout/AppLayout';
import { Toaster } from '@/components/ui/sonner';
import { useRealTimeNotifications } from '@/hooks/use-real-time-notifications';
import { type BreadcrumbItem, type SharedData } from '@/types';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

/**
 * Settings-area wrapper. Delegates the actual shell to the canonical
 * `<AppLayout />` so all pages render in the new Linear-Inspired shell.
 * Adds the global Toaster and wires real-time notifications.
 */
export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { auth } = usePage<SharedData>().props;
    useRealTimeNotifications(auth.user?.id ?? null);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
            <Toaster position="top-right" richColors closeButton />
        </AppLayoutTemplate>
    );
};