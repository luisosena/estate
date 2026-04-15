import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    Building2,
    CreditCard,
    DollarSign,
    Home,
    HelpCircle,
    LayoutDashboard,
    LogOut,
    Receipt,
    Settings,
    Users,
    Zap,
} from 'lucide-react';
import { route } from 'ziggy-js';

import { ModeToggle } from '@/components/mode-toggle';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { type SharedData } from '@/types';

/* ─── Types ──────────────────────────────────────────────────── */

interface Property {
    id: number;
    name: string;
    address?: string | null;
}

interface LandlordSidebarProps {
    properties?: Property[];
    unreadNotificationsCount?: number;
}

/* ─── Nav structure ──────────────────────────────────────────── */

const navGroups = [
    {
        title: 'Overview',
        items: [
            {
                label: 'Dashboard',
                icon: LayoutDashboard,
                href: () => route('landlord.dashboard'),
                routeName: 'landlord.dashboard',
                badge: null,
            },
        ],
    },
    {
        title: 'Portfolio',
        items: [
            {
                label: 'Properties',
                icon: Building2,
                href: () => route('landlord.properties.index'),
                routeName: 'landlord.properties.index',
                badge: null,
            },
            {
                label: 'Units',
                icon: Home,
                href: () => route('landlord.units.index'),
                routeName: 'landlord.units.index',
                badge: null,
            },
            {
                label: 'All Tenants',
                icon: Users,
                href: () => route('landlord.tenants.index'),
                routeName: 'landlord.tenants.index',
                badge: null,
            },
        ],
    },
    {
        title: 'Financials',
        items: [
            {
                label: 'Payments',
                icon: CreditCard,
                href: () => route('landlord.payments.index'),
                routeName: 'landlord.payments.index',
                badge: null,
            },
            {
                label: 'Rent Bills',
                icon: DollarSign,
                href: () => route('landlord.rent-bills.index'),
                routeName: 'landlord.rent-bills.index',
                badge: null,
            },
            {
                label: 'Utility Bills',
                icon: Receipt,
                href: () => route('landlord.utility-bills.index'),
                routeName: 'landlord.utility-bills.index',
                badge: null,
            },
            {
                label: 'Utilities',
                icon: Zap,
                href: () => route('landlord.utilities.index'),
                routeName: 'landlord.utilities.index',
                badge: null,
            },
        ],
    },
];

/* ─── Component ──────────────────────────────────────────────── */

export function LandlordSidebar({
    properties = [],
    unreadNotificationsCount = 0,
}: LandlordSidebarProps) {
    const page = usePage<SharedData>();
    const url = page.url;
    const { auth } = page.props;
    const user = auth?.user;
    const initials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) ?? 'LP';

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
        <Sidebar collapsible="icon" variant="inset">
            {/* ── Header: Logo + App Name + Trigger ───────── */}
            <SidebarHeader className="border-b border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center justify-between w-full px-1 py-1">
                            <Link
                                href={route('landlord.dashboard')}
                                className="flex items-center gap-2.5 overflow-hidden"
                            >
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                    <Building2 className="h-4 w-4" />
                                </div>
                                <span className="truncate font-semibold text-sm leading-tight">
                                    Estate Practice
                                </span>
                            </Link>
                            <SidebarTrigger className="ml-auto shrink-0 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* ── Content: Nav Groups ──────────────────────── */}
            <SidebarContent>
                {navGroups.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel className="uppercase tracking-widest text-[10px]">
                            {group.title}
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            {group.items.map(({ label, icon: Icon, href, routeName }) => (
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
                ))}

                {/* ── System group (Notifications with badge) ── */}
                <SidebarGroup>
                    <SidebarGroupLabel className="uppercase tracking-widest text-[10px]">
                        System
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                tooltip="Notifications"
                                isActive={isActive('landlord.notifications.index')}
                            >
                                <Link href={route('landlord.notifications.index')}>
                                    <Bell className="h-4 w-4" />
                                    <span>Notifications</span>
                                    {unreadNotificationsCount > 0 && (
                                        <SidebarMenuBadge className="bg-primary/10 text-primary font-semibold">
                                            {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                                        </SidebarMenuBadge>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                {/* ── Per-property quick links ──────────────── */}
                {properties.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel className="uppercase tracking-widest text-[10px]">
                            My Properties
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            {properties.map((property) => (
                                <SidebarMenuItem key={property.id}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={property.name}
                                        isActive={isPropertyActive(property.id)}
                                    >
                                        <Link
                                            href={route('landlord.properties.tenants', {
                                                property: property.id,
                                            })}
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

            {/* ── Footer: Theme + User + Sign out ─────────── */}
            <SidebarFooter className="border-t border-sidebar-border">
                {/* Theme toggle row */}
                <div className="flex items-center gap-2 px-1 group-data-[collapsible=icon]:justify-center">
                    <ModeToggle />
                    <span className="text-xs text-muted-foreground truncate group-data-[collapsible=icon]:hidden">
                        Toggle theme
                    </span>
                </div>

                <SidebarSeparator />

                {/* User row */}
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            tooltip={user?.name ?? 'Landlord'}
                            className="group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!justify-center"
                        >
                            <Avatar className="h-7 w-7 shrink-0 rounded-md">
                                <AvatarFallback className="rounded-md bg-primary/10 text-primary text-xs font-semibold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-0 overflow-hidden text-left leading-tight group-data-[collapsible=icon]:hidden">
                                <span className="truncate text-sm font-semibold">
                                    {user?.name ?? 'Landlord'}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {user?.email ?? ''}
                                </span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Sign out"
                            onClick={() => router.post('/logout')}
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Sign out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            {/* Drag-to-resize rail */}
            <SidebarRail />
        </Sidebar>
    );
}
