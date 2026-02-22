import { LogOut, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { AdminTabKey } from "@/components/admin/types";

type AdminHeaderProps = {
  userEmail: string;
  activeTab: AdminTabKey;
  onRefresh: () => void;
  onLogout: () => void;
  isLoading: boolean;
};

export function AdminHeader({
  userEmail,
  activeTab,
  onRefresh,
  onLogout,
  isLoading,
}: AdminHeaderProps) {
  const headings: Record<AdminTabKey, { title: string; description: string }> = {
    home: {
      title: "Dashboard",
      description: "Platform overview and performance metrics.",
    },
    users: {
      title: "User Management",
      description: "Review roles and manage access across the platform.",
    },
    lssns: {
      title: "LSSN Library",
      description: "Monitor lesson content, publishing, and engagement.",
    },
    categories: {
      title: "Categories",
      description: "Organize the taxonomy used across the platform.",
    },
    topics: {
      title: "Topics",
      description: "Keep learning tracks tidy and up to date.",
    },
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-6 px-8 py-8 app-bg">
      <div className="flex items-start gap-3">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-semibold text-strong">
            {headings[activeTab].title}
          </h1>
          <p className="text-muted mt-2">
            {headings[activeTab].description}
          </p>
          <p className="text-subtle mt-1 text-xs">Signed in as {userEmail}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="gap-2 app-input text-muted border app-border"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className="size-4" />
          {isLoading ? "Refreshing" : "Refresh"}
        </Button>
        <Button
          className="gap-2 bg-lime-800 hover:bg-lime-900 font-semibold text-white"
          onClick={onLogout}
        >
          <LogOut className="size-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
