import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, CreditCard, Zap, Bell, FileText, DollarSign } from 'lucide-react';
import { route } from 'ziggy-js';

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
        <Sidebar collapsible="icon" variant="floating" className="mt-25 mr-6 ml-4 max-h-3/5">
            <SidebarContent className="inline-block h-full min-h-screen">
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
