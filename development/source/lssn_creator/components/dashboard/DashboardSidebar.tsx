"use client";

import Link from "next/link";
import { Home, BarChart3, Library, FileText, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

type SectionKey = "home" | "stats" | "lssns" | "drafts" | "settings";

type DashboardSidebarProps = {
  activeSection: SectionKey;
  lssnsCount: number;
  draftsCount: number;
  onSectionChange: (section: SectionKey) => void;
};

export function DashboardSidebar({
  activeSection,
  lssnsCount,
  draftsCount,
  onSectionChange,
}: DashboardSidebarProps) {
  return (
    <>
      <div className="w-64 h-screen bg-cover ">

      </div>
      {/* <div className="w-64 fixed h-screen bg-[url('https://img.pikbest.com/backgrounds/20181106/space-planet-blue-universe-hd-background-map-download_2766161.jpg!bwr800')] bg-cover blur-xl opacity-20">

      </div> */}
      <aside className="w-64 fixed max-h-screen min-h-screen border-r-5 app-border">

        <div className="w-full h-auto p-5 rounded-xl">
          <div className="relative w-full h-28">
            <Image
              src="/logo.png"
              alt="creator"
              fill
              className="rounded-xl"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>

        {/* <div className="flex items-center gap-3 mb-8 px-5 py-6">
          <div className="h-10 w-10 rounded-lg primary-solid font-black flex items-center justify-center">L</div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-subtle">Creator Studio</div>
            <div className="text-lg font-semibold text-strong">Dashboard</div>
          </div>
        </div> */}

        <nav className="space-y-1 px-5 py-1">
          {[
            { key: "home", label: "Home", icon: Home },
            { key: "stats", label: "Stats", icon: BarChart3 },
            { key: "lssns", label: "LSSNs", icon: Library },
            { key: "drafts", label: "Drafts", icon: FileText },
            { key: "settings", label: "Settings", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSectionChange(item.key as SectionKey)}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${isActive
                  ? "app-surface-2 text-white border-0 app-border"
                  : "text-muted hover:bg-[#0b1220]"
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.key === "lssns" ? <span className="text-xs text-subtle">{lssnsCount}</span> : null}
                {item.key === "drafts" ? <span className="text-xs text-subtle">{draftsCount}</span> : null}
              </button>
            );
          })}
        </nav>

        {/* <div className="mt-8 p-4 rounded-xl border-5 app-border app-bg">
          <div className="text-xs uppercase tracking-[0.2em] text-subtle">Quick Action</div>
          <Link href="/create" className="inline-block mt-3">
            <Button className="gap-2 font-semibold bg-sky-500 hover:bg-sky-600 text-white">
              <Plus className="h-4 w-4 text-white" />
              Create New LSSN
            </Button>
          </Link>
        </div> */}
      </aside>
    </>
  );
}
