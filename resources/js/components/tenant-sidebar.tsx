import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { ChartColumn } from './animate-ui/icons/chart-column';
import { LayoutDashboard } from './animate-ui/icons/layout-dashboard';
import { Users } from './animate-ui/icons/users';

export function TenantSidebar() {
    const { state, setOpen } = useSidebar();

    const expandForSubmenu = () => {
        if (state === 'collapsed') {
            setOpen(true);
        }
    };

    const letterIcon = (letter: string) => (
        <span className="flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold">
            {letter}
        </span>
    );

    return (
        <Sidebar
            collapsible="icon"
            variant="floating"
            className="mt-25 mr-6 ml-4 max-h-3/5"
        >
            <SidebarContent className="h-40bg-gray-500 inline-block h-full min-h-screen">
                <SidebarGroup>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Dashboard">
                                <LayoutDashboard animateOnHover />
                                <span>Dashboard</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Analytics">
                                <ChartColumn animateOnHover />
                                <span>Analytics</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Tenants">
                                <Users animateOnHover />
                                <span>Tenants</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton tooltip="Documents">
                                        {letterIcon('D')}
                                        <span>Documents</span>
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>Item 1</DropdownMenuItem>
                                    <DropdownMenuItem>Item 2</DropdownMenuItem>
                                    <DropdownMenuItem>Item 3</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
                {/*
                <SidebarGroup className="mb-4">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                tooltip="Settings"
                                className="hover:bg-transparent"
                            >
                                {letterIcon('S')}
                                <span>Settings</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                tooltip="Logout"
                                className="hover:bg-transparent"
                            >
                                {letterIcon('L')}
                                <span>Logout</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
                */}
            </SidebarContent>
        </Sidebar>
    );
}
