"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";

function MailPreview() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Select an email to preview
    </div>
  );
}

export default function Page() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1 rounded-xl border m-2">
            <MailPreview />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
