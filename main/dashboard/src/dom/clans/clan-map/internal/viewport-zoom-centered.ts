import type { AtlasBox } from "../../../../shared/types/view-types.js";
import { clampAspectPreserving } from "../paint/calculators/viewport-calculator.js";
import { atlasCacheDims } from "./atlas-state.js";

export function zoomBounds(): { minDim: number; maxDim: number } {
    const dims = atlasCacheDims();
    return { minDim: dims.min, maxDim: dims.width };
}

export interface ZoomCenteredOpts {
    viewport: AtlasBox;
    ax: number;
    ay: number;
    factor: number;
    minDim: number;
    maxDim: number;
}

export function zoomCenteredOn({ viewport, ax, ay, factor, minDim, maxDim }: ZoomCenteredOpts): AtlasBox {
    const { w: newW, h: newH } = clampAspectPreserving(viewport.w * factor, viewport.h * factor, minDim, maxDim);
    return { x: ax - newW / 2, y: ay - newH / 2, w: newW, h: newH };
}
