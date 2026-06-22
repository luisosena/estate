import type { PropsWithChildren } from 'react';

import { DemoBanner } from '@/components/demo-banner';
import { AppContent } from '@/components/layout/app-content';
import { AppHeader } from '@/components/layout/app-header';
import { AppShell } from '@/components/layout/app-shell';
import { type BreadcrumbItem } from '@/types';

export default function AppHeaderLayout({
    children,
    breadcrumbs,
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell>
            <DemoBanner />
            <AppHeader breadcrumbs={breadcrumbs} />
            <AppContent>{children}</AppContent>
        </AppShell>
    );
}
