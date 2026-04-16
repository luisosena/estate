import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    Building2,
    LayoutDashboard,
    LogOut,
    Settings,
    Users,
    Activity,
    ShieldCheck,
} from 'lucide-react';
import React from 'react';
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
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { type SharedData } from '@/types';

/* ─── Nav structure ──────────────────────────────────────────── */

const navGroups = [
    {
        title: 'System Overview',
        items: [
            {
                label: 'Dashboard',
                icon: LayoutDashboard,
                href: () => route('admin.dashboard'),
                routeName: 'admin.dashboard',
            },
        ],
    },
    {
        title: 'Management',
        items: [
            {
                label: 'Properties',
                icon: Building2,
                href: () => route('admin.properties.index'),
                routeName: 'admin.properties.index',
            },
            {
                label: 'Landlords',
                icon: Users,
                href: () => route('admin.landlords.index'),
                routeName: 'admin.landlords.index',
            },
        ],
    },
    {
        title: 'Administration',
        items: [
            {
                label: 'System Settings',
                icon: Settings,
                href: () => '#',
                routeName: 'admin.settings',
                disabled: true,
            },
            {
                label: 'Audit Logs',
                icon: Activity,
                href: () => '#',
                routeName: 'admin.logs',
                disabled: true,
            },
        ],
    },
];

/* ─── Component ──────────────────────────────────────────────── */

export function AdminSidebar() {
    const page = usePage<SharedData>();
    const url = page.url;
    const { auth } = page.props;
    const user = auth?.user;

    const initials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) ?? 'AD';

    const isActive = (routeName: string) => {
        try {
            return url.startsWith(
                route(routeName).replace(window.location.origin, ''),
            );
        } catch {
            return false;
        }
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            {/* ── Header: Branding ───────── */}
            <SidebarHeader className="border-b border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center justify-between w-full px-1 py-1">
                            <Link
                                href={route('admin.dashboard')}
                                className="flex items-center gap-2.5 overflow-hidden"
                            >
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                    <ShieldCheck className="h-4 w-4" />
                                </div>
                                <span className="truncate font-bold text-sm leading-tight text-sidebar-foreground">
                                    Admin Portal
                                </span>
                            </Link>
                            <SidebarTrigger className="ml-auto shrink-0 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* ── Content: Groups ──────────────────────── */}
            <SidebarContent>
                {navGroups.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel className="uppercase tracking-widest text-[10px]">
                            {group.title}
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            {group.items.map(({ label, icon: Icon, href, routeName, disabled }) => (
                                <SidebarMenuItem key={routeName}>
                                    <SidebarMenuButton
                                        asChild={!disabled}
                                        tooltip={label}
                                        isActive={isActive(routeName)}
                                        disabled={disabled}
                                        className={disabled ? "opacity-50 cursor-not-allowed" : ""}
                                    >
                                        {disabled ? (
                                            <div className="flex items-center gap-2 px-2 py-1.5">
                                                <Icon className="h-4 w-4" />
                                                <span>{label}</span>
                                            </div>
                                        ) : (
                                            <Link href={href()}>
                                                <Icon className="h-4 w-4" />
                                                <span>{label}</span>
                                            </Link>
                                        )}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            {/* ── Footer: Theme + User ─────────── */}
            <SidebarFooter className="border-t border-sidebar-border">
                <div className="flex items-center gap-2 px-1 group-data-[collapsible=icon]:justify-center">
                    <ModeToggle />
                    <span className="text-xs text-muted-foreground truncate group-data-[collapsible=icon]:hidden">
                        Appearance
                    </span>
                </div>

                <SidebarSeparator />

                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            tooltip={user?.name ?? 'Administrator'}
                            className="group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!justify-center"
                        >
                            <Avatar className="h-7 w-7 shrink-0 rounded-md shadow-sm">
                                <AvatarFallback className="rounded-md bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-0 overflow-hidden text-left leading-tight group-data-[collapsible=icon]:hidden">
                                <span className="truncate text-sm font-semibold">
                                    {user?.name ?? 'Administrator'}
                                </span>
                                <span className="truncate text-[10px] text-muted-foreground uppercase font-medium">
                                    System Admin
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

            <SidebarRail />
        </Sidebar>
    );
}
