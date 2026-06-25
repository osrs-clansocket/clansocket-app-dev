import type { Instance } from "../../../../factory/index.js";
import { wireWheelScroll } from "./color-picker-wheel.js";
import { wirePointerDrag } from "./color-picker-pointer.js";

export function wireDragScroll(swatchGrid: Instance): void {
    wireWheelScroll(swatchGrid);
    wirePointerDrag(swatchGrid);
}
