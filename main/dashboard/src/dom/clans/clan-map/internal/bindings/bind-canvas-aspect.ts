import { effect, type Disposable } from "../../../../factory/reactive/index.js";
import { clampAspectPreserving } from "../../paint/calculators/viewport-calculator.js";
import type { MapStateSignals } from "../state.js";
import { clampToAtlas } from "../atlas-clamper.js";
import { atlasCacheDims } from "../atlas-state.js";

const ASPECT_EPS = 0.001;
const SIZE_EPS = 1;

function targetSize(dims: { w: number; h: number }, vp: { w: number; h: number }): { w: number; h: number } {
    const canvasAspect = dims.w / dims.h;
    const viewportAspect = vp.w / vp.h;
    if (Math.abs(canvasAspect - viewportAspect) < ASPECT_EPS) return { w: vp.w, h: vp.h };
    if (canvasAspect >= viewportAspect) return { w: vp.h * canvasAspect, h: vp.h };
    return { w: vp.w, h: vp.w / canvasAspect };
}

export function bindCanvasAspect(state: MapStateSignals): Disposable {
    return effect(() => {
        const dims = state.canvasDims$();
        const vp = state.viewport$();
        if (dims.w <= 0 || dims.h <= 0 || vp.w <= 0 || vp.h <= 0) return;
        const t = targetSize(dims, vp);
        const atlasDims = atlasCacheDims();
        const { w: newW, h: newH } = clampAspectPreserving(t.w, t.h, atlasDims.min, atlasDims.width);
        if (Math.abs(newW - vp.w) < SIZE_EPS && Math.abs(newH - vp.h) < SIZE_EPS) return;
        const centerX = vp.x + vp.w / 2;
        const centerY = vp.y + vp.h / 2;
        state.viewport$.set(clampToAtlas({ x: centerX - newW / 2, y: centerY - newH / 2, w: newW, h: newH }));
    });
}
