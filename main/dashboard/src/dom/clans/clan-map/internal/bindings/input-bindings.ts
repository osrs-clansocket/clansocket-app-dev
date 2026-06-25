import type { Disposable, ReadSignal } from "../../../../factory/reactive/index.js";
import type { PositionsState } from "../../../../../state/clans/stores/positions-store.js";
import type { MapRegionsState } from "../../../../../state/clans/stores/map-regions-store.js";
import { canvasToAtlas } from "../../paint/mappers/coordinate-mapper.js";
import { regionAt } from "../../paint/finders/region-finder.js";
import { viewportToComposite } from "../../paint/calculators/viewport-calculator.js";
import { WHEEL_ZOOM_PER_PIXEL } from "../../../../../shared/constants/clan/clan-map-constants.js";
import type { MapStateSignals } from "../state.js";
import { BLIP_HIT_RADIUS_DEV_PX, blipUnderCursor } from "../blip-finder.js";
import { clampToAtlas } from "../atlas-clamper.js";
import { computeNextViewport } from "../viewport-computer.js";

export { bindPan } from "./pan-binding.js";

function applyWheelZoom(
    canvasEl: HTMLElement,
    state: MapStateSignals,
    positions$: ReadSignal<PositionsState>,
    e: WheelEvent,
): void {
    e.preventDefault();
    const dpr = window.devicePixelRatio || 1;
    const rect = canvasEl.getBoundingClientRect();
    const mouseCx = (e.clientX - rect.left) * dpr;
    const mouseCy = (e.clientY - rect.top) * dpr;
    const factor = Math.exp(e.deltaY * WHEEL_ZOOM_PER_PIXEL);
    const { next, followed } = computeNextViewport({
        state,
        positions$,
        factor,
        anchorCanvasX: mouseCx,
        anchorCanvasY: mouseCy,
    });
    state.viewport$.set(clampToAtlas(next));
    if (!followed) state.mode$.set("manual");
}

export function bindZoom(
    canvasEl: HTMLElement,
    state: MapStateSignals,
    positions$: ReadSignal<PositionsState>,
): Disposable {
    const onWheel = (e: WheelEvent): void => applyWheelZoom(canvasEl, state, positions$, e);
    canvasEl.addEventListener("wheel", onWheel, { passive: false });
    return { dispose: () => canvasEl.removeEventListener("wheel", onWheel) };
}

interface HoverMoveArgs {
    canvasEl: HTMLElement;
    regions$: ReadSignal<MapRegionsState>;
    positions$: ReadSignal<PositionsState>;
    state: MapStateSignals;
    e: PointerEvent;
}

function applyHoverMove(args: HoverMoveArgs): void {
    const { canvasEl, regions$, positions$, state, e } = args;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvasEl.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * dpr;
    const cy = (e.clientY - rect.top) * dpr;
    const dims = state.canvasDims$();
    const view = viewportToComposite(state.viewport$(), dims.w, dims.h);
    const { ax, ay } = canvasToAtlas(view, cx, cy);
    state.hoverRegion$.set(regionAt(regions$(), ax, ay));
    const hit = blipUnderCursor({
        view,
        ps: positions$(),
        plane: state.activePlane$(),
        mouseCx: cx,
        mouseCy: cy,
        radius: BLIP_HIT_RADIUS_DEV_PX,
    });
    state.hoveredBlipHash$.set(hit);
}

export function bindHover(
    canvasEl: HTMLElement,
    regions$: ReadSignal<MapRegionsState>,
    positions$: ReadSignal<PositionsState>,
    state: MapStateSignals,
): Disposable {
    const onMove = (e: PointerEvent): void => applyHoverMove({ canvasEl, regions$, positions$, state, e });
    const onLeave = (): void => {
        state.hoverRegion$.set(null);
        state.hoveredBlipHash$.set(null);
    };
    canvasEl.addEventListener("pointermove", onMove);
    canvasEl.addEventListener("pointerleave", onLeave);
    return {
        dispose: () => {
            canvasEl.removeEventListener("pointermove", onMove);
            canvasEl.removeEventListener("pointerleave", onLeave);
        },
    };
}
