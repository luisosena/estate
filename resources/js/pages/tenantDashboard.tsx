import { Item, ItemContent, ItemGroup, ItemHeader, ItemMedia, ItemSeparator, ItemTitle } from "@/components/ui/item"





export default function TenantDashboard() {
  return (
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
    
  )
}