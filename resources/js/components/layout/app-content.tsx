import * as React from 'react';

import { SidebarInset } from '@/components/ui/sidebar';

interface AppContentProps extends React.ComponentProps<'main'> {
    variant?: 'header' | 'sidebar';
}

/**
 * @deprecated Use `<main>` directly inside `<AppLayout />`.
 * Kept as a backwards-compatible SidebarInset wrapper for older imports.
 */
export function AppContent({
    variant = 'sidebar',
    children,
    ...props
}: AppContentProps) {
    if (variant === 'sidebar') {
        return <SidebarInset {...props}>{children}</SidebarInset>;
    }

    return (
        <main
            className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4"
            {...props}
        >
            {children}
        </main>
    );
}