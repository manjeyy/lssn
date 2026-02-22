"use client";

import { useDrag } from "react-dnd";
import type { ElementType } from "@/components/creator/types";

const DND_TOOL_TYPE = "tool";

type ToolButtonProps = {
  type: Exclude<ElementType, "image">;
  title: string;
  icon: React.ReactNode;
};

export function ToolButton({ type, title, icon }: ToolButtonProps) {
  const [{ isDragging }, dragRef]: any = useDrag(
    () => ({
      type: DND_TOOL_TYPE,
      item: { elementType: type },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [type]
  );

  return (
    <div
      ref={dragRef}
      title={title}
      className="w-12 h-12 rounded-xl app-surface border app-border flex flex-col items-center justify-center gap-1 cursor-grab hover:bg-[#142036]"
      style={{ opacity: isDragging ? 0.6 : 1 }}
    >
      {icon}
    </div>
  );
}
