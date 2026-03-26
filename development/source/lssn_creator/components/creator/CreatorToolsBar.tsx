"use client";

import { Circle, Square, Star, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolButton } from "@/components/creator/ToolButton";

type CreatorToolsBarProps = {
  onRequestImageUpload: () => void;
};

export function CreatorToolsBar({ onRequestImageUpload }: CreatorToolsBarProps) {
  return (
    <div className="w-20 app-bg border-l app-border flex flex-col items-center py-6 gap-6 z-40 fixed h-full">
      <div className="text-[10px] font-bold text-subtle uppercase tracking-widest mb-2">Tools</div>

      <ToolButton type="text" title="Text" icon={<Type className="h-5 w-5 text-muted" />} />
      <ToolButton type="rectangle" title="Rectangle" icon={<Square className="h-5 w-5 text-muted" />} />
      <ToolButton type="circle" title="Circle" icon={<Circle className="h-5 w-5 text-muted" />} />
      <ToolButton type="star" title="Star" icon={<Star className="h-5 w-5 text-muted" />} />

      <Button
        variant="outline"
        className="w-12 h-12 rounded-xl border app-border text-muted app-surface p-0"
        title="Upload Image"
        onClick={onRequestImageUpload}
      >
        Img
      </Button>
    </div>
  );
}
