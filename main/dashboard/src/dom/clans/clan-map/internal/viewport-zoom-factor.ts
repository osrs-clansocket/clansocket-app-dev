import type { ReadSignal } from "../../../factory/reactive/index.js";
import type { AtlasBox } from "../../../../shared/types/view-types.js";
import type { PositionsState } from "../../../../state/clans/stores/positions-store.js";
import { canvasToAtlas } from "../paint/mappers/coordinate-mapper.js";
import { viewportToComposite, zoomViewportAround } from "../paint/calculators/viewport-calculator.js";
import { followedAtlasPoint } from "./followed-point-extractor.js";
import type { MapStateSignals } from "./state.js";
import { zoomBounds, zoomCenteredOn } from "./viewport-zoom-centered.js";

interface ZoomFactorOpts {
    state: MapStateSignals;
    positions$: ReadSignal<PositionsState>;
    factor: number;
    anchorCanvasX?: number;
    anchorCanvasY?: number;
}

export function computeNextViewport(opts: ZoomFactorOpts): { next: AtlasBox; followed: boolean } {
    const { state, positions$, factor, anchorCanvasX, anchorCanvasY } = opts;
    const viewport = state.viewport$();
    const dims = state.canvasDims$();
    const view = viewportToComposite(viewport, dims.w, dims.h);
    const followAnchor = followedAtlasPoint(positions$(), state.followedHash$());
    const { minDim, maxDim } = zoomBounds();
    if (followAnchor !== null) {
        return {
            next: zoomCenteredOn({ viewport, factor, minDim, maxDim, ax: followAnchor.ax, ay: followAnchor.ay }),
            followed: true,
        };
    }
    const cx = anchorCanvasX ?? dims.w / 2;
    const cy = anchorCanvasY ?? dims.h / 2;
    const { ax, ay } = canvasToAtlas(view, cx, cy);
    return {
        next: zoomViewportAround({ viewport, factor, minDim, maxDim, anchorAtlasX: ax, anchorAtlasY: ay }),
        followed: false,
    };
}
