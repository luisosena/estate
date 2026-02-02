import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarGroupAction,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuAction,
} from "@/components/ui/sidebar"
import { Link } from "@inertiajs/react"
import { route } from "ziggy-js"

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
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <SidebarTrigger />
        <Link  href={route('tenant.dashboard')}
        >Mail</Link>
      </SidebarInset>
    </SidebarProvider>
  )
}
