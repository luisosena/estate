import { Link } from "@inertiajs/react"
import { route } from "ziggy-js"
import { Tenant } from "@/types/index"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
} from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { usePage } from "@inertiajs/react"
import { type SharedData } from "@/types"


export default function Page() {
  const { tenants } = usePage<SharedData & { tenants: Tenant[] }>().props

  const getInitials = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0] ?? "")
      .join("")
      .toUpperCase()

  const statusBadgeVariant = (status: Tenant["status"]) => {
    if (status === "Late") return "destructive" as const
    if (status === "Vacating") return "secondary" as const
    return "outline" as const
  }

  return (
    <SidebarProvider>
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
        <span className="text-2xl pl-4">Dashbnoard</span>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl max-h-40" />
            <div className="bg-muted/50 aspect-video rounded-xl max-h-40" />
            <div className="bg-muted/50 aspect-video rounded-xl max-h-40" />
          </div>
          <Item className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min block m-0">
            <ItemHeader className="pb-4">
              <div className="flex flex-col gap-1">
                <ItemTitle className="text-base">Tenants</ItemTitle>
                <ItemDescription>
                  Manage tenants, units, and quick actions.
                </ItemDescription>
              </div>
              <ItemActions>
                <Button variant="outline" size="sm">
                  Add tenant
                </Button>
              </ItemActions>
            </ItemHeader>
            <ItemContent className="self-start">
              <ItemGroup>
                {tenants.map((tenant, index) => (
                  <div key={tenant.id} className="contents">
                    <Item variant="outline" size="sm" className="w-full">
                      <ItemMedia
                        variant="icon"
                        className="text-muted-foreground font-medium"
                      >
                        {getInitials(tenant.name)}
                      </ItemMedia>
                      <ItemContent className="min-w-0">
                        <ItemTitle className="min-w-0">
                          <span className="truncate">{tenant.name}</span>
                          <Badge variant={statusBadgeVariant(tenant.status)}>
                            {tenant.status}
                          </Badge>
                        </ItemTitle>
                        <ItemDescription className="truncate">
                          Unit {tenant.unit_number ?? "—"}
                          {tenant.email ? ` • ${tenant.email}` : ""}
                          {!tenant.email && tenant.phone ? ` • ${tenant.phone}` : ""}
                        </ItemDescription>
                      </ItemContent>
                      <ItemActions className="ml-auto">
                        <Link href={route('tenant.dashboard', tenant.id)}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          Message
                        </Button>
                      </ItemActions>
                    </Item>
                    {index < tenants.length - 1 ? <ItemSeparator /> : null}
                  </div>
                ))}
              </ItemGroup>
            </ItemContent>
          </Item>
        </div>
        </SidebarInset>
    </SidebarProvider>
  )
}
