import { viewportAroundBlip } from "../paint/calculators/viewport-calculator.js";
import { clampToAtlas } from "../internal/atlas-clamper.js";
import { atlasCacheDims } from "../internal/atlas-state.js";
import { currentMinRegions } from "../internal/mobile-detector.js";
import { regionPxOf } from "../internal/region-px-extractor.js";
import type { MapStateSignals } from "../internal/state.js";
import type { ClanMapProps } from "../clan-map-types.js";

export function focusOn(state: MapStateSignals, props: ClanMapProps, hash: string): void {
    const ps = props.positions$();
    const row = ps.byHash.get(hash);
    if (row === undefined || ps.mapMeta === null) return;
    state.activePlane$.set(row.location_plane);
    const dims = state.canvasDims$();
    const canvasAspect = dims.h > 0 ? dims.w / dims.h : 1;
    state.viewport$.set(
        clampToAtlas(
            viewportAroundBlip({
                row,
                canvasAspect,
                meta: ps.mapMeta,
                regionPx: regionPxOf(ps),
                regions: currentMinRegions(),
                maxDim: atlasCacheDims().width,
            }),
        ),
    );
    state.mode$.set("manual");
}
