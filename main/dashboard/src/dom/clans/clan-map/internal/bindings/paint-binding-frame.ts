import type { PositionsState } from "../../../../../state/clans/stores/positions-store.js";
import type { MapRegionsState } from "../../../../../state/clans/stores/map-regions-store.js";
import { collectBlips } from "../../paint/collectors/blip-collector.js";
import { paintBlips } from "../../paint/painters/blip-painter.js";
import { paintGrid } from "../../paint/painters/grid-painter.js";
import { paintTiles } from "../../paint/painters/tile-painter.js";
import { viewportToComposite } from "../../paint/calculators/viewport-calculator.js";
import type { BlipPositionAnimator } from "../../paint/animators/blip-position-animator.js";
import type { CanvasRefs, MapStateSignals } from "../state.js";
import type { TileCache } from "../../paint/caches/tile-cache.js";
import type { ReadSignal } from "../../../../factory/reactive/index.js";
import { advanceSmear, type SmearTracker } from "./paint-binding-smear.js";

export type { SmearTracker } from "./paint-binding-smear.js";

export interface PaintBindOpts {
    positions$: ReadSignal<PositionsState>;
    regions$: ReadSignal<MapRegionsState>;
    state: MapStateSignals;
    refs: CanvasRefs;
    cache: TileCache;
    blipAnimator: BlipPositionAnimator;
}

export interface PaintFrameOpts extends PaintBindOpts {
    bgCtx: CanvasRenderingContext2D;
    overlayCtx: CanvasRenderingContext2D;
    onTileReady: () => void;
    smearTracker: SmearTracker;
    blipAnimator: BlipPositionAnimator;
}

interface PaintTilesBlips {
    opts: PaintFrameOpts;
    ps: ReturnType<PaintFrameOpts["positions$"]>;
    regions: ReturnType<PaintFrameOpts["regions$"]>;
    view: ReturnType<typeof viewportToComposite>;
    viewport: ReturnType<PaintFrameOpts["state"]["viewport$"]>;
    dims: ReturnType<PaintFrameOpts["state"]["canvasDims$"]>;
    plane: number;
}

function paintTilesBlips(a: PaintTilesBlips): void {
    const { opts, ps, regions, view, viewport, dims, plane } = a;
    const { state, cache, bgCtx, overlayCtx, onTileReady, blipAnimator } = opts;
    paintTiles({ ctx: bgCtx, w: dims.w, h: dims.h, view, viewport, plane, cache, onTileReady });
    const blips = collectBlips(ps, plane, view, blipAnimator);
    paintBlips({
        blips,
        ctx: overlayCtx,
        w: dims.w,
        h: dims.h,
        alertedHashes: state.alertedHashes$(),
        showLastKnown: state.lastKnownVisible$(),
    });
    if (state.gridVisible$() && regions.length > 0) paintGrid({ ctx: overlayCtx, w: dims.w, h: dims.h, view, regions });
}

export function paintFrame(opts: PaintFrameOpts): void {
    const { positions$, regions$, state, smearTracker, blipAnimator, refs, onTileReady } = opts;
    if (smearTracker.residualRafId !== 0) {
        window.cancelAnimationFrame(smearTracker.residualRafId);
        smearTracker.residualRafId = 0;
    }
    const ps = positions$();
    if (ps.mapMeta === null) return;
    const dims = state.canvasDims$();
    const plane = state.activePlane$();
    const viewport = state.viewport$();
    const view = viewportToComposite(viewport, dims.w, dims.h);
    const now = performance.now();
    blipAnimator.update(ps, now);
    paintTilesBlips({ opts, ps, view, viewport, dims, plane, regions: regions$() });
    advanceSmear({ smearTracker, blipAnimator, refs, onTileReady, view, viewport, now });
    if (blipAnimator.hasActive(now)) state.paintTick$.set(state.paintTick$() + 1);
}

export function readPaintSignals(state: PaintBindOpts["state"]): void {
    state.viewport$();
    state.canvasDims$();
    state.activePlane$();
    state.gridVisible$();
    state.alertedHashes$();
    state.paintTick$();
    state.lastKnownVisible$();
    state.mergedLayersVisible$();
}
