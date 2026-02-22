"use client";

import { MousePointer2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CanvasElement } from "@/components/creator/types";

type SelectedRef = { cardId: number; elementId: string } | null;

type CreatorTopBarProps = {
  lssnTitle: string;
  itemsCount: number;
  selectedData: CanvasElement | null;
  selectedElement: SelectedRef;
  selectedCount: number;
  saveMessage: string | null;
  isSaving: boolean;
  onUpdateElement: (cardId: number, elementId: string, updates: Partial<CanvasElement>) => void;
  onRequestImageUpload: (replaceTarget?: { cardId: number; elementId: string }) => void;
  onDeleteSelected: () => void;
  onSaveDraft: () => void;
  onOpenPublish: () => void;
};

export function CreatorTopBar({
  lssnTitle,
  itemsCount,
  selectedData,
  selectedElement,
  selectedCount,
  saveMessage,
  isSaving,
  onUpdateElement,
  onRequestImageUpload,
  onDeleteSelected,
  onSaveDraft,
  onOpenPublish,
}: CreatorTopBarProps) {
  return (
    <div className="h-16 border-b app-border app-surface flex items-center px-6 gap-6 z-50">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg primary-solid font-black flex items-center justify-center">
          L
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-subtle">Creator Studio</div>
          <div className="text-lg font-semibold text-strong">LSSN Creator</div>
        </div>
      </div>
      <div className="flex items-center gap-6 flex-1 min-w-0">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.2em] text-subtle">Project</div>
          <div className="text-sm font-semibold text-strong truncate">
            {lssnTitle.trim() || "Untitled LSSN"}
          </div>
        </div>
        <div className="text-xs text-subtle">{itemsCount} slides</div>
        <div className="h-8 w-px app-border mx-2"></div>
        {selectedData && selectedElement ? (
          <div className="flex items-center gap-5">
            {selectedData.type !== "image" && (
              <div className="flex items-center gap-3">
                <Label className="text-[11px] font-semibold text-subtle uppercase tracking-wider">Fill</Label>
                <div className="relative group">
                  <div
                    className="w-8 h-8 rounded-full border app-border overflow-hidden cursor-pointer"
                    style={{ backgroundColor: selectedData.fill }}
                  >
                    <Input
                      type="color"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full p-0 border-0"
                      value={selectedData.fill}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.cardId, selectedElement.elementId, {
                          fill: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedData.type === "text" && (
              <>
                <div className="h-8 w-px app-border"></div>
                <div className="flex items-center gap-3">
                  <Label className="text-[11px] font-semibold text-subtle uppercase tracking-wider">Color</Label>
                  <div className="relative group">
                    <div
                      className="w-8 h-8 rounded-full border app-border overflow-hidden cursor-pointer"
                      style={{ backgroundColor: selectedData.color }}
                    >
                      <Input
                        type="color"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full p-0 border-0"
                        value={selectedData.color}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.cardId, selectedElement.elementId, {
                            color: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Label className="text-[11px] font-semibold text-subtle uppercase tracking-wider">Size</Label>
                  <Input
                    type="number"
                    className="w-20 h-9 app-input focus-visible:ring-0 focus-visible:border-cyan-400"
                    value={selectedData.fontSize}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.cardId, selectedElement.elementId, {
                        fontSize: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Label className="text-[11px] font-semibold text-subtle uppercase tracking-wider">Text</Label>
                  <Input
                    className="w-48 h-9 app-input focus-visible:ring-0 focus-visible:border-cyan-400"
                    value={selectedData.content}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.cardId, selectedElement.elementId, {
                        content: e.target.value,
                      })
                    }
                  />
                </div>
              </>
            )}
            <div className="h-8 w-px app-border"></div>
            {selectedData.type === "image" && (
              <Button
                variant="outline"
                size="sm"
                className="border app-border text-muted app-surface"
                onClick={() => onRequestImageUpload(selectedElement)}
              >
                Replace
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-muted hover:text-red-300 hover:bg-red-500/10"
              onClick={onDeleteSelected}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="text-muted text-sm flex items-center gap-2">
            <MousePointer2 className="h-4 w-4" />
            <span>
              {selectedCount > 1
                ? `${selectedCount} elements selected`
                : "Select an element to edit properties"}
            </span>
            {selectedCount > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted hover:text-red-300 hover:bg-red-500/10 ml-4"
                onClick={onDeleteSelected}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {saveMessage ? <span className="text-xs text-emerald-300">{saveMessage}</span> : null}
        <Button
          variant="outline"
          className="border app-border text-muted app-surface"
          onClick={onSaveDraft}
          disabled={isSaving}
        >
          Save Draft
        </Button>
        <Button className="primary-solid font-semibold" onClick={onOpenPublish} disabled={isSaving}>
          {isSaving ? "Saving..." : "Publish"}
        </Button>
      </div>
    </div>
  );
}
