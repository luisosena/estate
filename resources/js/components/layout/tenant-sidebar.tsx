import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, CreditCard, Zap, Bell, FileText, DollarSign } from 'lucide-react';
import { route } from 'ziggy-js';

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { ModeToggle } from '@/components/mode-toggle';
import { TenantNotificationBell } from '@/components/tenant-notification-bell';

const navItems = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: () => route('tenant.dashboard'),
        routeName: 'tenant.dashboard',
    },
    {
        label: 'Payments',
        icon: CreditCard,
        href: () => route('tenant.payments'),
        routeName: 'tenant.payments',
    },
    {
        label: 'Utilities',
        icon: Zap,
        href: () => route('tenant.utilities'),
        routeName: 'tenant.utilities',
    },
    {
        label: 'Utility Bills',
        icon: FileText,
        href: () => route('tenant.utilities.bills'),
        routeName: 'tenant.utilities.bills',
    },
    {
        label: 'Rent Bills',
        icon: DollarSign,
        href: () => route('tenant.rent-bills.index'),
        routeName: 'tenant.rent-bills.index',
    },
    {
        label: 'Notifications',
        icon: Bell,
        href: () => route('tenant.notifications.index'),
        routeName: 'tenant.notifications.index',
    },
];

export function TenantSidebar() {
    const { url } = usePage();

    const isActive = (routeName: string) => {
        try {
            return url.startsWith(route(routeName).replace(window.location.origin, ''));
        } catch {
            return false;
        }
    };

    return (
        <Sidebar collapsible="icon" variant="floating" className="mt-[6.25rem] mr-6 ml-4 h-[calc(100svh-8rem)]">
            <SidebarContent>
                {/* Top header area for triggers and toggles */}
                <div className="p-2 flex items-center justify-between">
                    <SidebarTrigger className="-ml-1 text-muted-foreground hover:bg-muted" />
                    <div className="flex items-center gap-1.5">
                        <ModeToggle />
                    </div>
                </div>
                <SidebarGroup>
                    <SidebarMenu>
                        {navItems.map(({ label, icon: Icon, href, routeName }) => (
                            <SidebarMenuItem key={routeName}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={label}
                                    isActive={isActive(routeName)}
                                >
                                    <Link href={href()}>
                                        <Icon className="h-4 w-4" />
                                        <span>{label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
