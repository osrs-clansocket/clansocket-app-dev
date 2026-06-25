import { effect, type Disposable, type ReadSignal } from "../../../../factory/reactive/index.js";
import type { PositionsState } from "../../../../../state/clans/stores/positions-store.js";
import { autoViewport } from "../../paint/calculators/viewport-calculator.js";
import { dominantPlaneIndex } from "../../paint/resolvers/plane-resolver.js";
import type { MapStateSignals } from "../state.js";
import { clampToAtlas } from "../atlas-clamper.js";
import { atlasCacheDims } from "../atlas-state.js";
import { regionPxOf } from "../region-px-extractor.js";

export function bindAutoViewport(positions$: ReadSignal<PositionsState>, state: MapStateSignals): Disposable {
    let planeInitialized = false;
    return effect(() => {
        const ps = positions$();
        if (!planeInitialized && ps.byHash.size > 0) {
            planeInitialized = true;
            state.activePlane$.set(dominantPlaneIndex(ps));
        }
        if (state.mode$() !== "auto") return;
        const plane = state.activePlane$();
        const dims = state.canvasDims$();
        const canvasAspect = dims.h > 0 ? dims.w / dims.h : 1;
        state.viewport$.set(
            clampToAtlas(
                autoViewport({
                    plane,
                    canvasAspect,
                    state: ps,
                    regionPx: regionPxOf(ps),
                    maxDim: atlasCacheDims().width,
                }),
            ),
        );
    });
}
