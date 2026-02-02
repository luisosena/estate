import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

export default function Test() {
    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader />
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <span>Sukuna</span>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <span>Gojo</span>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <span>Itadori</span>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Link href={route('mail')}>Mail</Link>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter />
                <SidebarRail />
            </Sidebar>
            <SidebarInset>
                <SidebarTrigger />
                <Link href={route('tenant.dashboard')}>Mail</Link>
            </SidebarInset>
        </SidebarProvider>
    );
}
