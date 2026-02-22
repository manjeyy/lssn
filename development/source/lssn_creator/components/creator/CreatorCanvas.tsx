"use client";

import { Rnd } from "react-rnd";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import type { ElementType, CanvasElement } from "@/components/creator/types";
import { CanvasSurface } from "@/components/creator/CanvasSurface";

export type Guideline = { type: "horizontal" | "vertical"; pos: number };
export type SelectionBox = { x: number; y: number; width: number; height: number } | null;

type CreatorCanvasProps = {
  items: number[];
  cardsData: Record<number, CanvasElement[]>;
  selectedElements: { cardId: number; elementId: string }[];
  guidelines: Guideline[];
  guidelineCardId: number | null;
  selectionBox: SelectionBox;
  activeCardId: number | null;
  onDropTool: (cardId: number, type: ElementType, x: number, y: number) => void;
  onDropFile: (cardId: number, file: File, x: number, y: number) => void;
  onMouseDown: (event: React.MouseEvent, cardId: number) => void;
  onMouseMove: (event: React.MouseEvent, cardId: number) => void;
  onMouseUp: () => void;
  onAddItem: () => void;
  onElementDragStart: (event: any, cardId: number, elementId: string, isSelected: boolean) => void;
  onElementDrag: (cardId: number, elementId: string, d: any, width: number, height: number) => void;
  onElementDragStop: (cardId: number) => void;
  onElementResizeStop: (cardId: number, elementId: string, ref: any, position: any) => void;
  onElementClick: (event: any, cardId: number, elementId: string, isSelected: boolean) => void;
  isDraggingRef: React.MutableRefObject<boolean>;
  setApi: (api: any) => void;
};

export function CreatorCanvas({
  items,
  cardsData,
  selectedElements,
  guidelines,
  guidelineCardId,
  selectionBox,
  activeCardId,
  onDropTool,
  onDropFile,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onAddItem,
  onElementDragStart,
  onElementDrag,
  onElementDragStop,
  onElementResizeStop,
  onElementClick,
  isDraggingRef,
  setApi,
}: CreatorCanvasProps) {
  return (
    <div className="flex-1 app-bg relative flex flex-col items-center justify-center">
      <div className="absolute inset-0 creator-grid pointer-events-none opacity-60"></div>
      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          containScroll: false,
          watchDrag: false,
        }}
        className="w-screen z-10"
      >
        <CarouselContent>
          {items.map((item) => (
            <CarouselItem key={item} className="basis-1/4 pl-4">
              <div className="p-1 h-full py-0">
                <Card className="h-[70vh] overflow-hidden p-0 relative app-surface-2 border app-border rounded-2xl shadow-none">
                  <CanvasSurface
                    cardId={item}
                    className="w-full h-full relative app-surface"
                    onDropTool={onDropTool}
                    onDropFile={onDropFile}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                  >
                    {guidelineCardId === item &&
                      guidelines.map((guide, i) => (
                        <div
                          key={`${guide.type}-${guide.pos}-${i}`}
                          className="absolute bg-emerald-400 z-50 pointer-events-none"
                          style={{
                            left: guide.type === "vertical" ? guide.pos : 0,
                            top: guide.type === "horizontal" ? guide.pos : 0,
                            width: guide.type === "vertical" ? "1px" : "100%",
                            height: guide.type === "horizontal" ? "1px" : "100%",
                          }}
                        />
                      ))}

                    {selectionBox && activeCardId === item && (
                      <div
                        className="absolute border border-cyan-400 bg-cyan-400/10 z-50 pointer-events-none"
                        style={{
                          left: selectionBox.x,
                          top: selectionBox.y,
                          width: selectionBox.width,
                          height: selectionBox.height,
                        }}
                      />
                    )}

                    <div className="absolute inset-12 border border-dashed app-border pointer-events-none" />

                    {cardsData[item]?.map((el) => {
                      const RndComponent = Rnd as any;
                      const isSelected = selectedElements.some(
                        (sel) => sel.elementId === el.id && sel.cardId === item
                      );
                      return (
                        <RndComponent
                          key={el.id}
                          size={{ width: el.width, height: el.height }}
                          position={{ x: el.x, y: el.y }}
                          onDragStart={(e: any) => {
                            isDraggingRef.current = false;
                            onElementDragStart(e, item, el.id, isSelected);
                          }}
                          onDrag={(e: any, d: any) => {
                            isDraggingRef.current = true;
                            onElementDrag(item, el.id, d, el.width, el.height);
                          }}
                          onDragStop={() => {
                            onElementDragStop(item);
                          }}
                          onResizeStop={(e: any, direction: any, ref: any, delta: any, position: any) => {
                            onElementResizeStop(item, el.id, ref, position);
                          }}
                          onClick={(e: any) => {
                            onElementClick(e, item, el.id, isSelected);
                          }}
                          bounds="parent"
                          className={`group z-10 ${
                            isSelected
                              ? "outline outline-2 outline-cyan-400 outline-offset-2"
                              : "hover:outline hover:outline-1 hover:outline-cyan-300 hover:outline-offset-1"
                          }`}
                        >
                          <div
                            className="w-full h-full flex items-center justify-center overflow-hidden"
                            style={{
                              backgroundColor: el.type !== "text" ? el.fill : undefined,
                              color: el.color,
                              fontSize: el.fontSize,
                              borderRadius: el.type === "circle" ? "50%" : "4px",
                              clipPath:
                                el.type === "star"
                                  ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
                                  : undefined,
                            }}
                          >
                            {el.type === "text" ? el.content : null}
                            {el.type === "image" && el.src ? (
                              <img
                                src={el.src}
                                alt="Uploaded"
                                draggable={false}
                                className="w-full h-full object-cover"
                              />
                            ) : null}
                          </div>
                        </RndComponent>
                      );
                    })}
                    {(!cardsData[item] || cardsData[item].length === 0) && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08]">
                        <span className="text-[12rem] font-black text-strong">{item}</span>
                      </div>
                    )}
                  </CanvasSurface>
                </Card>
              </div>
            </CarouselItem>
          ))}
          <CarouselItem className="basis-1/4 pl-4">
            <div className="p-1 h-full flex items-center justify-center py-0">
              <Card
                className="cursor-pointer h-[70vh] w-full app-surface border-dashed border-2 app-border hover:border-[#2b3f5c] flex items-center justify-center group shadow-none"
                onClick={onAddItem}
              >
                <CardContent className="flex flex-col items-center justify-center p-6 gap-4">
                  <div className="w-16 h-16 rounded-full app-bg border app-border flex items-center justify-center">
                    <span className="text-4xl font-light text-muted">+</span>
                  </div>
                  <span className="text-muted font-medium">Add New Slide</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
  );
}
