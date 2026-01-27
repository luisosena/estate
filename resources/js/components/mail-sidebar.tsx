import { Sidebar, SidebarInset, SidebarTrigger, SidebarHeader, SidebarContent} from "@/components/ui/sidebar"
import { Item, ItemContent, ItemGroup, ItemHeader, ItemTitle } from "@/components/ui/item"

export function MailSidebar(){
  return (
    <Sidebar>
      <SidebarHeader className="block relative">
        <span className="text-3xl">Mail</span>
        <SidebarTrigger className="absolute top-4 right-0"/>
      </SidebarHeader>
      <SidebarContent>
        
      </SidebarContent>
    </Sidebar>

  )
}