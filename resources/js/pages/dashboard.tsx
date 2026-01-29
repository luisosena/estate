import { Tenant } from "@/types/index"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { usePage } from "@inertiajs/react"
import { type SharedData } from "@/types"
import Stats07 from "@/components/stats-07"
import TenantsTable from "@/components/tenants-table"

export default function Page() {
  const { tenants } = usePage<SharedData & { tenants: Tenant[] }>().props

  return (
    <div className="pt-20">
      <SidebarProvider >
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              {/*<Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">
                      Building Your Application
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>*/}
            </div>
          </header>
          <span className="text-2xl p-4">Dashboard</span>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div /*className="grid auto-rows-min gap-4 md:grid-cols-3"*/>
            {/*
              <div className="bg-muted/50 aspect-video rounded-xl max-h-40" />
              <div className="bg-muted/50 aspect-video rounded-xl max-h-40" />
              <div className="bg-muted/50 aspect-video rounded-xl max-h-40" />
            */}
            <Stats07 />
            </div>
            <div className="bg-muted/50 rounded-xl h-50 w-full p-4">
              <span className="text-xl">Summary</span>
            </div>
            <div className="bg-muted/50 min-h-0 flex-1 rounded-xl p-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base text-xl font-semibold">Tenants</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage tenants, units, and quick actions.
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Add tenant
                  </Button>
                </div>
                <TenantsTable tenants={tenants} />
              </div>
            </div>
          </div>
          </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
