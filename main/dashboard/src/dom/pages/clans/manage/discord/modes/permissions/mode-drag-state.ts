import { svgPrimitive } from "../../../../../../factory/content-ops/graphics/svg.js";
import type { DragKind } from "./mode-constants.js";

export const svgLine = svgPrimitive<SVGLineElement>("line");

let currentDragKind: DragKind | null = null;
let currentDragId: string | null = null;

export function setDragSource(kind: DragKind, id: string): void {
    currentDragKind = kind;
    currentDragId = id;
}

export function clearDragSource(): void {
    currentDragKind = null;
    currentDragId = null;
}

export function getDragKind(): DragKind | null {
    return currentDragKind;
}

export function getDragId(): string | null {
    return currentDragId;
}
