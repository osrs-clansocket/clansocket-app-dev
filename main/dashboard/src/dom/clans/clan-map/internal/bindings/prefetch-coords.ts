import { expandViewport } from "../../paint/calculators/viewport-calculator.js";
import { computeTileRange } from "../../paint/calculators/tile-range-calculator.js";
import { pickZoom } from "../../paint/pickers/zoom-picker.js";
import { MAX_ZOOM, MIN_ZOOM } from "../../../../../shared/constants/clan/clan-map-constants.js";
import type { AtlasBox } from "../../../../../shared/types/view-types.js";

const PREFETCH_MARGIN = 3;
const ADJACENT_MARGIN = 1;
const ADJACENT_ZOOM_DELTAS: readonly number[] = [-1, 1];

export interface AncestorCoord {
    zoom: number;
    tx: number;
    ty: number;
}

function pushCoordsAt(coords: AncestorCoord[], viewport: AtlasBox, zoom: number, margin: number): void {
    const expanded = expandViewport(viewport, margin);
    const range = computeTileRange(expanded, zoom);
    for (let ty = range.tyMin; ty <= range.tyMax; ty++) {
        for (let tx = range.txMin; tx <= range.txMax; tx++) {
            if (tx < 0 || ty < 0) continue;
            coords.push({ zoom, tx, ty });
        }
    }
}

export function collectPrefetchCoords(viewport: AtlasBox, view: { scale: number }): AncestorCoord[] {
    const zoom = pickZoom(view.scale);
    const coords: AncestorCoord[] = [];
    pushCoordsAt(coords, viewport, zoom, PREFETCH_MARGIN);
    for (const delta of ADJACENT_ZOOM_DELTAS) {
        const adjZoom = zoom + delta;
        if (adjZoom < MIN_ZOOM || adjZoom > MAX_ZOOM) continue;
        pushCoordsAt(coords, viewport, adjZoom, ADJACENT_MARGIN);
    }
    return coords;
}
