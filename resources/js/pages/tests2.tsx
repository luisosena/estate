import { type SharedData } from "@/types"
import { Tenant } from "@/types/index"
import { usePage } from "@inertiajs/react"

import  Table05 from '@/components/tenants-table'

export default function Table() {
  const { tenants } = usePage<SharedData & { tenants: Tenant[] }>().props
  return(
    <>
    <Table05 />
    <div>
      {tenants.map((tenant, index) => (
        <div key={tenant.id} className="contents">
          <div>{tenant.name}</div>
        </div>
      ))}
    </div>
    </>
  )
}