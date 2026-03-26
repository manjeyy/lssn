import * as React from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type AdminShellProps = {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
};

export function AdminShell({ sidebar, header, children }: AdminShellProps) {
  return (
    <SidebarProvider defaultOpen>
      {sidebar}
      <SidebarInset className="app-bg">
        <div className="flex min-h-svh flex-col app-bg text-strong">
          <div className="sticky top-0 z-10 border-b app-border">
            {header}
          </div>
          <div className="flex-1 px-8 py-8">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
