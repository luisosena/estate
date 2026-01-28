import { type SharedData } from "@/types"
import { Tenant } from "@/types/index"
import { usePage } from "@inertiajs/react"
import TenantsTable from "@/components/tenants-table"

export default function Table() {
  const { tenants } = usePage<SharedData & { tenants: Tenant[] }>().props
  return (
    <div className="p-4">
      <TenantsTable tenants={tenants} />
    </div>
  )
}