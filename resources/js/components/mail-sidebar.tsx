import { Sidebar, SidebarInset, SidebarTrigger} from "@/components/ui/sidebar"
import { Item, ItemContent, ItemGroup, ItemHeader, ItemTitle } from "@/components/ui/item"

export default function MailSidebar(){
  return (
    <Sidebar>
      <SidebarInset>
        <SidebarTrigger/>
      </SidebarInset>
    </Sidebar>

  )
}