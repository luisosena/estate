import { AppSidebar } from "@/components/app-sidebar"
import {SidebarProvider, SidebarInset, SidebarTrigger} from "@/components/ui/sidebar"
import { Item, ItemContent, ItemGroup, ItemHeader, ItemTitle } from "@/components/ui/item"
import { TenantSidebar } from "@/components/tenant-sidebar"
import Table05 from "@/components/table-05"
import { Input } from "@/components/ui/input"
import { MessageCircleMore, Bell } from 'lucide-react';

export default function TenantDashboard() {
  const data = [
    { id: 1, header: "Header 1", type: "Type 1", status: "Status 1" },
    { id: 2, header: "Header 2", type: "Type 2", status: "Status 2" },
    { id: 3, header: "Header 3", type: "Type 3", status: "Status 3" },
  ]
  return (
    <SidebarProvider>
    <TenantSidebar />
    <SidebarInset>
      <div className=" p-4">
        <div className="flex items-center">
          <SidebarTrigger className="ml-[-10px] mr-4" />
          <span className="text-2xl font-bold">Tenant Dashboard</span>
          <MessageCircleMore className="ml-auto mr-4" />
          <Bell />
          {/*
          <Input placeholder="Enter text" className="w-50 h-7" />
          */}
        </div>
        <div className="flex direction-row gap-4 mt-12 h-28">
          <div className="flex-1 bg-white h-full rounded-xl"></div>
          <div className="flex-1 bg-green-500 h-full rounded-xl"></div>
          <div className="flex-1 bg-red-500 h-full rounded-xl"></div>
        </div>
        <div className="mt-65 ">
          <span className="text-2xl font-bold border-b-2 border-gray-200">Utilities</span>
          <div className="mt-4">
            <Table05 />
          </div> 
        </div>
      </div>
    </SidebarInset>
    </SidebarProvider>
  )
}