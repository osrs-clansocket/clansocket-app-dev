import type { AtlasBox, CompositeView } from "../../../../../shared/types/view-types.js";

export {
    aspectFit,
    autoViewport,
    viewportAroundBlip,
    type AroundBlipArgs,
    type AutoViewportArgs,
} from "./viewport-auto.js";
export { clampAspectPreserving, zoomViewportAround } from "./viewport-calc-zoom.js";

let cachedKey = "";
let cachedResult: CompositeView = { scale: 0, offsetX: 0, offsetY: 0 };

export function viewportToComposite(viewport: AtlasBox, canvasW: number, canvasH: number): CompositeView {
    const key = `${viewport.x}|${viewport.y}|${viewport.w}|${viewport.h}|${canvasW}|${canvasH}`;
    if (key === cachedKey) return cachedResult;
    const scale = Math.min(canvasW / viewport.w, canvasH / viewport.h);
    const contentW = viewport.w * scale;
    const contentH = viewport.h * scale;
    cachedResult = {
        scale,
        offsetX: (canvasW - contentW) / 2 - viewport.x * scale,
        offsetY: (canvasH - contentH) / 2 - viewport.y * scale,
    };
    cachedKey = key;
    return cachedResult;
}

export function expandViewport(viewport: AtlasBox, factor: number): AtlasBox {
    const dw = (viewport.w * (factor - 1)) / 2;
    const dh = (viewport.h * (factor - 1)) / 2;
    return {
        x: viewport.x - dw,
        y: viewport.y - dh,
        w: viewport.w * factor,
        h: viewport.h * factor,
    };
}
