"use client";

import { useRef } from "react";
import { useDrop } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import type { ElementType } from "@/components/creator/types";

const DND_TOOL_TYPE = "tool";

type CanvasSurfaceProps = {
  cardId: number;
  className?: string;
  onDropTool: (cardId: number, type: ElementType, x: number, y: number) => void;
  onDropFile: (cardId: number, file: File, x: number, y: number) => void;
  onMouseDown: (event: React.MouseEvent, cardId: number) => void;
  onMouseMove: (event: React.MouseEvent, cardId: number) => void;
  onMouseUp: () => void;
  children: React.ReactNode;
};

export function CanvasSurface({
  cardId,
  className,
  onDropTool,
  onDropFile,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  children,
}: CanvasSurfaceProps) {
  const surfaceRef = useRef<HTMLDivElement | null>(null);

  const [, dropRef] = useDrop(
    () => ({
      accept: [DND_TOOL_TYPE, NativeTypes.FILE],
      drop: (item, monitor) => {
        const clientOffset = monitor.getClientOffset();
        const surface = surfaceRef.current;
        if (!clientOffset || !surface) return;

        const rect = surface.getBoundingClientRect();
        const x = clientOffset.x - rect.left;
        const y = clientOffset.y - rect.top;

        if (monitor.getItemType() === NativeTypes.FILE) {
          const files = (item as { files?: File[] }).files ?? [];
          const file = files[0];
          if (file) {
            onDropFile(cardId, file, x, y);
          }
          return;
        }

        const tool = item as { elementType: ElementType };
        if (tool?.elementType) {
          onDropTool(cardId, tool.elementType, x, y);
        }
      },
    }),
    [cardId, onDropTool, onDropFile]
  );

  dropRef(surfaceRef);

  return (
    <div
      ref={surfaceRef}
      className={className}
      onMouseDown={(event) => onMouseDown(event, cardId)}
      onMouseMove={(event) => onMouseMove(event, cardId)}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {children}
    </div>
  );
}
