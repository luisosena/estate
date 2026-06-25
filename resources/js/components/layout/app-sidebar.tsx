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
import { route } from 'ziggy-js';

import { AppLogo } from '@/components/layout/app-logo';
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
    {
        title: 'Account',
        items: [
            { label: 'Settings', icon: Settings, route: 'profile.edit' },
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
    {
        title: 'Account',
        items: [
            { label: 'Settings', icon: Settings, route: 'profile.edit' },
        ],
    },
];

/* ─── Component ──────────────────────────────────────────────── */

export function AppSidebar() {
    const { url, props } = usePage<SharedData>();
    const user = props.auth?.user;
    const role = user?.role as 'admin' | 'landlord' | 'tenant';
    const isDemoUser = props.isDemoUser as boolean;

    const unreadNotificationsCount = (props.unreadNotificationsCount as number) || 0;
    const properties = (props.properties as any[]) || [];

    const initials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) ?? 'EP';

    const getNavGroups = (): NavGroup[] => {
        let groups: NavGroup[] = [];
        switch (role) {
            case 'admin': groups = ADMIN_NAV; break;
            case 'landlord': groups = LANDLORD_NAV; break;
            case 'tenant': groups = TENANT_NAV; break;
            default: groups = []; break;
        }

        if (isDemoUser) {
            return groups
                .map((group) => ({
                    ...group,
                    items: group.items.filter((item) => !item.route.includes('settings') && !item.route.includes('profile')),
                }))
                .filter((group) => group.items.length > 0);
        }

        return groups;
    };

    const getNotificationRoute = () => {
        switch (role) {
            case 'admin': return 'admin.notifications.index';
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

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            {/* Header: Brand */}
            <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
                <AppLogo />
            </SidebarHeader>

            {/* Content: Role-based Navigation */}
            <SidebarContent className="gap-0 px-2 py-3">
                {getNavGroups().map((group) => (
                    <SidebarGroup key={group.title} className="px-0 py-2">
                        <SidebarGroupLabel className="px-2 mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {group.title}
                        </SidebarGroupLabel>
                        <SidebarMenu className="gap-0.5">
                            {group.items.map((item) => (
                                <SidebarMenuItem key={item.route}>
                                    <SidebarMenuButton
                                        asChild={!item.disabled}
                                        tooltip={item.label}
                                        isActive={isActive(item.route)}
                                        disabled={item.disabled}
                                        size="default"
                                        className={
                                            item.disabled
                                                ? 'h-8 px-2 opacity-50 cursor-not-allowed'
                                                : 'h-8 px-2'
                                        }
                                    >
                                        {item.disabled ? (
                                            <div className="flex items-center gap-2.5">
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.label}</span>
                                            </div>
                                        ) : (
                                            <Link href={route(item.route)}>
                                                <item.icon className="h-4 w-4 text-muted-foreground group-data-[active=true]:text-primary" />
                                                <span className="text-sm">{item.label}</span>
                                            </Link>
                                        )}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}

                {/* System Group (Common) */}
                {getNotificationRoute() && route().has(getNotificationRoute()) && (
                    <SidebarGroup className="px-0 py-2">
                        <SidebarGroupLabel className="px-2 mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            System
                        </SidebarGroupLabel>
                        <SidebarMenu className="gap-0.5">
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    tooltip="Notifications"
                                    isActive={isActive(getNotificationRoute())}
                                    size="default"
                                    className="h-8 px-2"
                                >
                                    <Link href={route(getNotificationRoute())}>
                                        <Bell className="h-4 w-4 text-muted-foreground group-data-[active=true]:text-primary" />
                                        <span className="text-sm">Notifications</span>
                                        {unreadNotificationsCount > 0 && (
                                            <SidebarMenuBadge className="ml-auto bg-primary text-primary-foreground text-[10px] font-medium px-1.5 h-4 min-w-[16px]">
                                                {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                                            </SidebarMenuBadge>
                                        )}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                )}

                {/* Landlord Property Quick Links */}
                {role === 'landlord' && properties.length > 0 && (
                    <SidebarGroup className="px-0 py-2">
                        <SidebarGroupLabel className="px-2 mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Managed Properties
                        </SidebarGroupLabel>
                        <SidebarMenu className="gap-0.5">
                            {properties.map((property) => (
                                <SidebarMenuItem key={property.id}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={property.name}
                                        isActive={isPropertyActive(property.id)}
                                        size="default"
                                        className="h-8 px-2"
                                    >
                                        <Link href={route('landlord.properties.tenants', { property: property.id })}>
                                            <Building2 className="h-4 w-4 text-muted-foreground group-data-[active=true]:text-primary" />
                                            <span className="truncate text-sm">{property.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                )}
            </SidebarContent>

            {/* Footer: Theme + User Profile */}
            <SidebarFooter className="border-t border-sidebar-border gap-2 p-3">
                <div className="flex items-center gap-2 px-1 group-data-[collapsible=icon]:justify-center">
                    <ModeToggle />
                    <span className="text-xs text-muted-foreground truncate group-data-[collapsible=icon]:hidden">
                        Appearance
                    </span>
                </div>

                <SidebarSeparator className="opacity-50" />

                <SidebarMenu className="gap-0.5">
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="default"
                            tooltip={user?.name ?? 'User Account'}
                            asChild={!isDemoUser && route().has('profile.edit')}
                            className="h-9 px-2"
                        >
                            {!isDemoUser && route().has('profile.edit') ? (
                                <Link href={route('profile.edit')}>
                                    <Avatar size="sm" className="h-7 w-7 shrink-0">
                                        <AvatarFallback className="text-[10px]">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex min-w-0 flex-col gap-0 overflow-hidden text-left leading-tight group-data-[collapsible=icon]:hidden">
                                        <span className="truncate text-sm font-medium text-foreground capitalize">
                                            {user?.name ?? 'User Account'}
                                        </span>
                                        <span className="truncate text-[10px] text-muted-foreground uppercase tracking-wide">
                                            {role} account
                                        </span>
                                    </div>
                                </Link>
                            ) : (
                                <div className="flex items-center gap-2.5 w-full">
                                    <Avatar size="sm" className="h-7 w-7 shrink-0">
                                        <AvatarFallback className="text-[10px]">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex min-w-0 flex-col gap-0 overflow-hidden text-left leading-tight group-data-[collapsible=icon]:hidden">
                                        <span className="truncate text-sm font-medium text-foreground capitalize">
                                            {user?.name ?? 'User Account'}
                                        </span>
                                        <span className="truncate text-[10px] text-muted-foreground uppercase tracking-wide">
                                            {role} account{isDemoUser && ' · demo'}
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
                            size="default"
                            className="h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="text-sm">Log out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}