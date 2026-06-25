import type { AtlasBox } from "../../../../../shared/types/view-types.js";
import { clampAspectPreserving } from "./viewport-clamp.js";

export { clampAspectPreserving } from "./viewport-clamp.js";

interface ZoomViewportOpts {
    viewport: AtlasBox;
    anchorAtlasX: number;
    anchorAtlasY: number;
    factor: number;
    minDim: number;
    maxDim: number;
}

export function zoomViewportAround({
    viewport,
    anchorAtlasX,
    anchorAtlasY,
    factor,
    minDim,
    maxDim,
}: ZoomViewportOpts): AtlasBox {
    const { w: newW, h: newH } = clampAspectPreserving(viewport.w * factor, viewport.h * factor, minDim, maxDim);
    const relX = (anchorAtlasX - viewport.x) / viewport.w;
    const relY = (anchorAtlasY - viewport.y) / viewport.h;
    return {
        x: anchorAtlasX - relX * newW,
        y: anchorAtlasY - relY * newH,
        w: newW,
        h: newH,
    };
}
