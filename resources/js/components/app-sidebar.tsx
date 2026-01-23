/* "use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Plus
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarRail,
  SidebarGroupAction,
} from "@/components/ui/sidebar"
import { 
  Collapsible,
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible"
// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

/* export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
 */

/*
export function AppSidebar() {
  return(
      <Sidebar>
        <SidebarHeader>
          <div>HEADER</div>
        </SidebarHeader>
        <SidebarContent>
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel>Group 1</SidebarGroupLabel>
              <CollapsibleTrigger>
                <Plus />
              </CollapsibleTrigger>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <span>Item 1</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <span>Item 1</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <span>Item 1</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </Collapsible>
          <SidebarGroup>
            <SidebarGroupLabel>Group 1</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <span>Item 1</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <span>Item 1</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <span>Item 1</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div>FOOTER</div>
        </SidebarFooter>
      </Sidebar>
  )
} */

import { useState } from "react";


export default function Sidebar() {
  const [ecomOpen, setEcomOpen] = useState(false);

  return (
    <div className="w-64 min-h-screen bg-gray-900 text-white p-4">
      {/* Logo / Title */}
      <div className="mb-6 text-xl font-bold flex items-center gap-2">
        <PiFolderSimpleLight className="text-white text-2xl" />
        Shadcn UI Kit
      </div>

      {/* Dashboards */}
      <div className="mb-4">
        <div className="text-gray-400 uppercase text-xs mb-2">Dashboards</div>
        <ul className="space-y-1">
          <li className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 cursor-pointer">
            <PiClockClockwiseLight />
            Classic Dashboard
          </li>

          {/* E-commerce Menu */}
          <li>
            <div
              className="flex items-center justify-between gap-2 p-2 rounded hover:bg-gray-800 cursor-pointer"
              onClick={() => setEcomOpen(!ecomOpen)}
            >
              <div className="flex items-center gap-2">
                <PiShoppingCartSimpleLight />
                E-commerce
              </div>
              <span>{ecomOpen ? "▾" : "▸"}</span>
            </div>

            {ecomOpen && (
              <ul className="ml-6 mt-1 space-y-1">
                <li className="p-2 rounded hover:bg-gray-800 cursor-pointer">
                  Dashboard
                </li>
                <li className="p-2 rounded hover:bg-gray-800 cursor-pointer">
                  Product List
                </li>
                <li className="p-2 rounded hover:bg-gray-800 cursor-pointer">
                  Product Detail
                </li>
                <li className="p-2 rounded hover:bg-gray-800 cursor-pointer">
                  Add Product
                </li>
                <li className="p-2 rounded hover:bg-gray-800 cursor-pointer">
                  Order List
                </li>
                <li className="p-2 rounded hover:bg-gray-800 cursor-pointer">
                  Order Detail
                </li>
              </ul>
            )}
          </li>

          {/* Other Dashboards */}
          <li className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 cursor-pointer mt-2">
            <PiCurrencyDollarLight />
            Payment Dashboard
          </li>
          <li className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 cursor-pointer">
            <PiBuildingsLight />
            Hotel Dashboard
          </li>
          <li className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 cursor-pointer">
            <PiFolderSimpleLight />
            Project Management
          </li>
          <li className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 cursor-pointer">
            <PiChartLineLight />
            Sales
          </li>
          <li className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 cursor-pointer">
            <PiUserLight />
            CRM
          </li>
        </ul>
      </div>
    </div>
  );
}
