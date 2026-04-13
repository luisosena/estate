import { Item, ItemContent, ItemGroup, ItemHeader, ItemTitle } from "@/components/shared/item"
import { Sidebar, SidebarInset, SidebarTrigger, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton} from "@/components/ui/sidebar"

export function MailSidebar(){
  return (
    <Sidebar>
      <SidebarHeader className="block relative">
        <span className="text-3xl">Mail</span>
        <SidebarTrigger className="absolute top-4 right-0"/>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
            <SidebarMenuButton>
              <SidebarMenuItem>
                <span>Inbox</span>
              </SidebarMenuItem>
            </SidebarMenuButton>
            <SidebarMenuButton>
              <SidebarMenuItem>
                <span>Sent</span>
              </SidebarMenuItem>
            </SidebarMenuButton>
            <SidebarMenuButton>
              <SidebarMenuItem>
                <span>Bin</span>
              </SidebarMenuItem>
            </SidebarMenuButton>
            <SidebarMenuButton>
              <SidebarMenuItem>
                <span>Spam</span>
              </SidebarMenuItem>
            </SidebarMenuButton>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>

  )
}