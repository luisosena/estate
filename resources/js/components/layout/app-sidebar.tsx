import { Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    Bell,
    Building2,
    CreditCard,
    DollarSign,
    FileText,
    Home,
    LayoutDashboard,
    LogOut,
    Receipt,
    Settings,
    ShieldCheck,
    Upload,
    Users,
    Zap,
} from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

import { cn } from '@/lib/utils';
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

/* ─── Nav Structure Definitions ──────────────────────────────── */

interface NavItem {
    label: string;
    icon: React.ElementType;
    route: string;
    disabled?: boolean;
}

interface NavGroup {
    title: string;
    items: NavItem[];
}

const ADMIN_NAV: NavGroup[] = [
    {
        title: 'System Overview',
        items: [
            { label: 'Dashboard', icon: LayoutDashboard, route: 'admin.dashboard' },
        ],
    },
    {
        title: 'Management',
        items: [
            { label: 'Properties', icon: Building2, route: 'admin.properties.index' },
            { label: 'Landlords', icon: Users, route: 'admin.landlords.index' },
        ],
    },
    {
        title: 'Administration',
        items: [
            { label: 'System Settings', icon: Settings, route: 'admin.settings', disabled: true },
            { label: 'Audit Logs', icon: Activity, route: 'admin.logs', disabled: true },
        ],
    },
];

const LANDLORD_NAV: NavGroup[] = [
    {
        title: 'Overview',
        items: [
            { label: 'Dashboard', icon: LayoutDashboard, route: 'landlord.dashboard' },
        ],
    },
    {
        title: 'Portfolio',
        items: [
            { label: 'Properties', icon: Building2, route: 'landlord.properties.index' },
            { label: 'Units', icon: Home, route: 'landlord.units.index' },
            { label: 'All Tenants', icon: Users, route: 'landlord.tenants.index' },
            { label: 'Bulk Import', icon: Upload, route: 'landlord.import.index' },
        ],
    },
    {
        title: 'Financials',
        items: [
            { label: 'Payments', icon: CreditCard, route: 'landlord.payments.index' },
            { label: 'Rent Bills', icon: DollarSign, route: 'landlord.rent-bills.index' },
            { label: 'Utility Bills', icon: Receipt, route: 'landlord.utility-bills.index' },
            { label: 'Utilities', icon: Zap, route: 'landlord.utilities.index' },
        ],
    },
];

const TENANT_NAV: NavGroup[] = [
    {
        title: 'Overview',
        items: [
            { label: 'Dashboard', icon: LayoutDashboard, route: 'tenant.dashboard' },
        ],
    },
    {
        title: 'Financials',
        items: [
            { label: 'Payments', icon: CreditCard, route: 'tenant.payments' },
            { label: 'Rent Bills', icon: DollarSign, route: 'tenant.rent-bills.index' },
        ],
    },
    {
        title: 'Services',
        items: [
            { label: 'Utilities', icon: Zap, route: 'tenant.utilities' },
            { label: 'Utility Bills', icon: FileText, route: 'tenant.utilities.bills' },
            { label: 'Documents', icon: FileText, route: 'tenant.documents.index' },
        ],
    },
];

/* ─── Component ──────────────────────────────────────────────── */

export function AppSidebar() {
    const { url, props } = usePage<SharedData>();
    const user = props.auth?.user;
    const role = user?.role as 'admin' | 'landlord' | 'tenant';
    const isDemoUser = props.isDemoUser as boolean;
    
    // Notifications & Properties (Dynamic props from Inertia)
    const unreadNotificationsCount = (props.unreadNotificationsCount as number) || 0;
    const properties = (props.properties as any[]) || [];

    const initials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) ?? 'EP';

    const getNavGroups = () => {
        let groups: NavGroup[] = [];
        switch (role) {
            case 'admin': groups = ADMIN_NAV; break;
            case 'landlord': groups = LANDLORD_NAV; break;
            case 'tenant': groups = TENANT_NAV; break;
            default: groups = []; break;
        }

        if (isDemoUser) {
            return groups.map(group => ({
                ...group,
                items: group.items.filter(item => !item.route.includes('settings'))
            })).filter(group => group.items.length > 0);
        }

        return groups;
    };

    const getNotificationRoute = () => {
        switch (role) {
            case 'admin': return 'admin.notifications.index'; // Future proofing
            case 'landlord': return 'landlord.notifications.index';
            case 'tenant': return 'tenant.notifications.index';
            default: return '';
        }
    };

    const isActive = (routeName: string) => {
        try {
            if (!route().has(routeName)) return false;
            return url.startsWith(route(routeName).replace(window.location.origin, ''));
        } catch {
            return false;
        }
    };

    const isPropertyActive = (propertyId: number) => {
        if (role !== 'landlord') return false;
        try {
            const propertyTenantsUrl = route('landlord.properties.tenants', { property: propertyId })
                .replace(window.location.origin, '');
            return url.startsWith(propertyTenantsUrl);
        } catch {
            return false;
        }
    };

    const BrandingIcon = () => {
        if (role === 'admin') return <ShieldCheck className="h-4 w-4" />;
        return <Building2 className="h-4 w-4" />;
    };

    const BrandingLabel = () => {
        if (role === 'admin') return 'Admin Portal';
        return 'Estate Practice';
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            
            {/* Header: Identity */}
            <SidebarHeader className="border-b border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center justify-between w-full px-1 py-1">
                            <Link
                                href={user ? route(`${role}.dashboard`) : '/'}
                                className="flex items-center gap-2.5 overflow-hidden"
                            >
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                                    <BrandingIcon />
                                </div>
                                <span className="truncate font-bold text-sm leading-tight text-sidebar-foreground">
                                    {BrandingLabel()}
                                </span>
                            </Link>
                            <SidebarTrigger className="ml-auto shrink-0 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Content: Role-based Navigation */}
            <SidebarContent>
                {getNavGroups().map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel className="uppercase tracking-widest text-[10px] font-bold opacity-60">
                            {group.title}
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            {group.items.map((item) => (
                                <SidebarMenuItem key={item.route}>
                                    <SidebarMenuButton
                                        asChild={!item.disabled}
                                        tooltip={item.label}
                                        isActive={isActive(item.route)}
                                        disabled={item.disabled}
                                        className={item.disabled ? "opacity-50 cursor-not-allowed" : ""}
                                    >
                                        {item.disabled ? (
                                            <div className="flex items-center gap-3">
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.label}</span>
                                            </div>
                                        ) : (
                                            <Link href={route(item.route)}>
                                                <item.icon className="h-4 w-4 text-muted-foreground group-data-[active=true]:text-primary" />
                                                <span className="font-medium">{item.label}</span>
                                            </Link>
                                        )}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}

                {/* System Group (Common) */}
                <SidebarGroup>
                    <SidebarGroupLabel className="uppercase tracking-widest text-[10px] font-bold opacity-60">
                        System
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {getNotificationRoute() && route().has(getNotificationRoute()) && (
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    tooltip="Notifications"
                                    isActive={isActive(getNotificationRoute())}
                                >
                                    <Link href={route(getNotificationRoute())}>
                                        <Bell className="h-4 w-4 text-muted-foreground group-data-[active=true]:text-primary" />
                                        <span className="font-medium">Notifications</span>
                                        {unreadNotificationsCount > 0 && (
                                            <SidebarMenuBadge className="bg-primary/10 text-primary font-bold text-[10px] px-1.5 h-4 min-w-[16px]">
                                                {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                                            </SidebarMenuBadge>
                                        )}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                    </SidebarMenu>
                </SidebarGroup>

                {/* Landlord Property Quick Links */}
                {role === 'landlord' && properties.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel className="uppercase tracking-widest text-[10px] font-bold opacity-60">
                            Managed Properties
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            {properties.map((property) => (
                                <SidebarMenuItem key={property.id}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={property.name}
                                        isActive={isPropertyActive(property.id)}
                                    >
                                        <Link href={route('landlord.properties.tenants', { property: property.id })}>
                                            <Building2 className="h-4 w-4 text-muted-foreground group-data-[active=true]:text-primary" />
                                            <span className="truncate font-medium">{property.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                )}
            </SidebarContent>

            {/* Footer: Theme + User Profile */}
            <SidebarFooter className="border-t border-sidebar-border gap-3 p-4">
                <div className="flex items-center gap-3 px-1 group-data-[collapsible=icon]:justify-center">
                    <ModeToggle />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-tight truncate group-data-[collapsible=icon]:hidden">
                        Appearance
                    </span>
                </div>

                <SidebarSeparator className="opacity-50" />

                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            tooltip={user?.name ?? 'User Account'}
                            className={cn(
                                "group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!justify-center",
                                isDemoUser ? "hover:bg-transparent cursor-default" : "hover:bg-sidebar-accent"
                            )}
                            asChild={!isDemoUser && route().has('profile.edit')}
                        >
                            {!isDemoUser && route().has('profile.edit') ? (
                                <Link href={route('profile.edit')}>
                                    <Avatar className="h-8 w-8 shrink-0 rounded-lg shadow-sm">
                                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-black border border-primary/20">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col gap-0.5 overflow-hidden text-left leading-tight group-data-[collapsible=icon]:hidden">
                                        <span className="truncate text-sm font-bold text-foreground capitalize">
                                            {user?.name ?? 'User Account'}
                                        </span>
                                        <span className="truncate text-[10px] text-muted-foreground uppercase font-black opacity-70">
                                            {role} Account
                                        </span>
                                    </div>
                                </Link>
                            ) : (
                                <div className="flex items-center gap-3 w-full">
                                    <Avatar className="h-8 w-8 shrink-0 rounded-lg shadow-sm">
                                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-black border border-primary/20">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col gap-0.5 overflow-hidden text-left leading-tight group-data-[collapsible=icon]:hidden">
                                        <span className="truncate text-sm font-bold text-foreground capitalize">
                                            {user?.name ?? 'User Account'}
                                        </span>
                                        <span className="truncate text-[10px] text-muted-foreground uppercase font-black opacity-70">
                                            {role} Account {isDemoUser && '(Demo)'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Sign out"
                            onClick={() => router.post('/logout')}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors font-bold text-xs"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Log out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
