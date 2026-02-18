import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { router } from '@inertiajs/react';
import { ChartColumn } from '@/components/animate-ui/icons/chart-column';
import { LayoutDashboard } from '@/components/animate-ui/icons/layout-dashboard';
import { Users } from '@/components/animate-ui/icons/users';

export function AppSidebar() {
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

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarContent className="pt-4">
                <SidebarGroup>
                    <SidebarGroupLabel>Group 1</SidebarGroupLabel>
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
                        {/*
              <Collapsible defaultOpen className="">
                <SidebarMenuItem className="flex flex-wrap items-center">
                  <CollapsibleTrigger className="flex items-center">
                    <span className="mr-auto">Collapsible</span>
                    <SidebarMenuButton className="">+</SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="w-full">
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton isActive>
                          <span>Item 1</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton>
                          <span>Item 2</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton>
                          <span>Item 3</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
              */}
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                tooltip="Documents"
                                onClick={expandForSubmenu}
                            >
                                {letterIcon('D')}
                                <span>Documents</span>
                            </SidebarMenuButton>
                            <SidebarMenuSub>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton>
                                        <span>Item 1</span>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton>
                                        <span>Item 2</span>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton>
                                        <span>Item 3</span>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            </SidebarMenuSub>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup className="mt-auto mb-4">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Settings">
                                {letterIcon('S')}
                                <span>Settings</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Help">
                                {letterIcon('H')}
                                <span>Help</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Contact Us">
                                {letterIcon('C')}
                                <span>Contact Us</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={handleLogout}>
                                {letterIcon('L')}
                                <span>LOG OUT</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
