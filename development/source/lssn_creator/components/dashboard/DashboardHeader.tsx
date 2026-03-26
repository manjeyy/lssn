"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type SectionKey = "home" | "stats" | "lssns" | "drafts" | "settings";

type DashboardHeaderProps = {
  activeSection: SectionKey;
};

export function DashboardHeader({ activeSection }: DashboardHeaderProps) {
  return (
    <div className="border-b app-border app-bg px-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-strong">
            {activeSection === "home" && "Overview"}
            {activeSection === "stats" && "Performance Stats"}
            {activeSection === "lssns" && "All LSSNs"}
            {activeSection === "drafts" && "Drafts"}
            {activeSection === "settings" && "Settings"}
          </h1>
          <p className="text-muted mt-2">
            {activeSection === "home" && "Track progress, manage lessons, and monitor engagement."}
            {activeSection === "stats" && "See how your lessons perform over time."}
            {activeSection === "lssns" && "Manage all published and draft lessons in one place."}
            {activeSection === "drafts" && "Continue editing drafts before publishing."}
            {activeSection === "settings" && "Profile and workspace preferences."}
          </p>
        </div>
        <Link href="/create">
          <Button className="gap-2 bg-sky-500 hover:bg-sky-600 font-semibold text-white">
            <Plus className="h-5 w-5 text-white" />
            Create New LSSN
          </Button>
        </Link>
      </div>
    </div>
  );
}
