export type ElementType = "text" | "rectangle" | "circle" | "star" | "image";

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  src?: string;
  fill: string;
  color: string;
  fontSize?: number;
}
