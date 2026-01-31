import { AppSidebar } from "@/components/app-sidebar"
import {SidebarProvider, SidebarInset, SidebarTrigger} from "@/components/ui/sidebar"
import { Item, ItemContent, ItemGroup, ItemHeader, ItemTitle } from "@/components/ui/item"
import { TenantSidebar } from "@/components/tenant-sidebar"


export default function TenantDashboard() {
  return (
    <SidebarProvider>
    <TenantSidebar />
    <SidebarInset>
      <SidebarTrigger className="-ml-1" />
    <Item>
      <ItemHeader>
        <ItemTitle>Tenant Dashboard</ItemTitle>
      </ItemHeader>
      <ItemContent>
        <ItemGroup>
          <Item>
            <ItemContent>
              <span>tenant.</span>
            </ItemContent>
          </Item>
        </ItemGroup>
      </ItemContent>
    </Item>
    </SidebarInset>
    </SidebarProvider>
  )
}