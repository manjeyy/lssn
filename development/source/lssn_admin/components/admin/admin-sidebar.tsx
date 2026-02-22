import {
  BookOpenCheck,
  LayoutDashboard,
  LogOut,
  Shapes,
  Tags,
  Users2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import type { AdminTabKey } from "@/components/admin/types";

const navItems: Array<{ key: AdminTabKey; label: string; icon: typeof Users2 }> = [
  { key: "home", label: "Home", icon: LayoutDashboard },
  { key: "users", label: "Users", icon: Users2 },
  { key: "lssns", label: "LSSNs", icon: BookOpenCheck },
  { key: "categories", label: "Categories", icon: Shapes },
  { key: "topics", label: "Topics", icon: Tags },
];

type AdminSidebarProps = {
  activeTab: AdminTabKey;
  onTabChange: (tab: AdminTabKey) => void;
  onLogout: () => void;
};

export function AdminSidebar({
  activeTab,
  onTabChange,
  onLogout,
}: AdminSidebarProps) {
  return (
    <>
      <Sidebar collapsible="icon" variant="inset" className="border-r app-border app-bg">
        <SidebarHeader>
          <div className="flex items-center gap-2 rounded-lg app-surface-2 px-3 py-3">
            <BookOpenCheck className="size-5 text-lime-800" />
            <div className="flex flex-col">
              <span className="text-md font-semibold text-strong">
                LSSN Admin
              </span>
              <span className="text-xs text-subtle">Control Center</span>
            </div>
          </div>
          <SidebarInput placeholder="Search..." className="app-input" />
        </SidebarHeader>
        <SidebarSeparator className="app-border" />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-subtle">Manage</SidebarGroupLabel>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      isActive={activeTab === item.key}
                      onClick={() => onTabChange(item.key)}
                      tooltip={item.label}
                      className={
                        isActive
                          ? "app-surface-2 text-strong"
                          : "text-muted hover:bg-[#0b1220]"
                      }
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator className="app-border" />
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={onLogout}
                tooltip="Logout"
                className="text-muted hover:bg-[#0b1220]"
              >
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarRail />
    </>
  );
}
