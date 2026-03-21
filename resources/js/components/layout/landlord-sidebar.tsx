import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Users, Building2, Home, Bell, Zap, Receipt, DollarSign, CreditCard } from 'lucide-react';
import { route } from 'ziggy-js';
import NotificationBell from '@/components/notification-bell';

interface Property {
    id: number;
    name: string;
    address?: string | null;
}

interface LandlordSidebarProps {
    properties?: Property[];
    unreadNotificationsCount?: number;
}

const mainNavItems = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: () => route('landlord.dashboard'),
        routeName: 'landlord.dashboard',
    },
    {
        label: 'Properties',
        icon: Building2,
        href: () => route('landlord.properties.index'),
        routeName: 'landlord.properties.index',
    },
    {
        label: 'Units',
        icon: Home,
        href: () => route('landlord.units.index'),
        routeName: 'landlord.units.index',
    },
    {
        label: 'All Tenants',
        icon: Users,
        href: () => route('landlord.tenants.index'),
        routeName: 'landlord.tenants.index',
    },
    {
        label: 'Payments',
        icon: CreditCard,
        href: () => route('landlord.payments.index'),
        routeName: 'landlord.payments.index',
    },
    {
        label: 'Utilities',
        icon: Zap,
        href: () => route('landlord.utilities.index'),
        routeName: 'landlord.utilities.index',
    },
    {
        label: 'Utility Bills',
        icon: Receipt,
        href: () => route('landlord.utility-bills.index'),
        routeName: 'landlord.utility-bills.index',
    },
    {
        label: 'Rent Bills',
        icon: DollarSign,
        href: () => route('landlord.rent-bills.index'),
        routeName: 'landlord.rent-bills.index',
    },
    {
        label: 'Notifications',
        icon: Bell,
        href: () => route('landlord.notifications.index'),
        routeName: 'landlord.notifications.index',
    },
];

export function LandlordSidebar({ properties = [], unreadNotificationsCount = 0 }: LandlordSidebarProps) {
    const { url } = usePage();

    const isActive = (routeName: string) => {
        try {
            return url.startsWith(
                route(routeName).replace(window.location.origin, ''),
            );
        } catch {
            return false;
        }
    };

    const isPropertyActive = (propertyId: number) => {
        try {
            const propertyTenantsUrl = route('landlord.properties.tenants', {
                property: propertyId,
            }).replace(window.location.origin, '');
            return url.startsWith(propertyTenantsUrl);
        } catch {
            return false;
        }
    };

    return (
        <Sidebar
            collapsible="icon"
            variant="floating"
            className="mt-25 mr-6 ml-4 max-h-3/5"
        >
            <SidebarContent className="inline-block h-full min-h-screen">
                {/* Sidebar trigger at the top */}
                <div className="p-2 flex items-center justify-between">
                    <SidebarTrigger className="-ml-1" />
                    <NotificationBell initialUnreadCount={unreadNotificationsCount} />
                </div>
                
                {/* Main navigation */}
                <SidebarGroup>
                    <SidebarMenu>
                        {mainNavItems.map(({ label, icon: Icon, href, routeName }) => (
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

                {/* Per-property tenant views */}
                {properties.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Properties</SidebarGroupLabel>
                        <SidebarMenu>
                            {properties.map((property) => (
                                <SidebarMenuItem key={property.id}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={property.name}
                                        isActive={isPropertyActive(property.id)}
                                    >
                                        <Link
                                            href={route('landlord.properties.tenants', { property: property.id })}
                                        >
                                            <Building2 className="h-4 w-4" />
                                            <span>{property.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                )}
            </SidebarContent>
        </Sidebar>
    );
}
