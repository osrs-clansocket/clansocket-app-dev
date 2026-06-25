import type { BlipPositionAnimator } from "../paint/animators/blip-position-animator.js";
import { clanMapControls } from "../controls/controls.js";
import { clanMapMinimap } from "../minimap/minimap.js";
import { clanMapNames } from "../names/names.js";
import type { MapStateSignals } from "../internal/state.js";
import { resetView, zoomByFactor } from "../internal/actions.js";
import type { ClanMapProps } from "../clan-map-types.js";

const ZOOM_STEP = 0.75;

function buildSubControls(state: MapStateSignals, props: ClanMapProps): ReturnType<typeof clanMapControls> {
    return clanMapControls({
        mode$: state.mode$,
        activePlane$: state.activePlane$,
        gridVisible$: state.gridVisible$,
        namesVisible$: state.namesVisible$,
        lastKnownVisible$: state.lastKnownVisible$,
        mergedLayersVisible$: state.mergedLayersVisible$,
        hoverRegion$: state.hoverRegion$,
        positions$: props.positions$,
        onZoomIn: () => zoomByFactor(state, props.positions$, ZOOM_STEP),
        onZoomOut: () => zoomByFactor(state, props.positions$, 1 / ZOOM_STEP),
        onResetView: () => resetView(state),
    });
}

function buildSubMinimap(state: MapStateSignals, props: ClanMapProps): ReturnType<typeof clanMapMinimap> {
    return clanMapMinimap({
        positions$: props.positions$,
        viewport$: state.viewport$,
        activePlane$: state.activePlane$,
        mode$: state.mode$,
        alertedHashes$: state.alertedHashes$,
        paintTick$: state.paintTick$,
        followedHash$: state.followedHash$,
    });
}

function buildSubNames(
    state: MapStateSignals,
    props: ClanMapProps,
    blipAnimator: BlipPositionAnimator,
): ReturnType<typeof clanMapNames> {
    return clanMapNames({
        positions$: props.positions$,
        viewport$: state.viewport$,
        canvasDims$: state.canvasDims$,
        activePlane$: state.activePlane$,
        visible$: state.namesVisible$,
        lastKnownVisible$: state.lastKnownVisible$,
        hoveredBlipHash$: state.hoveredBlipHash$,
        paintTick$: state.paintTick$,
        blipAnimator,
    });
}

export function buildSubviews(
    state: MapStateSignals,
    props: ClanMapProps,
    blipAnimator: BlipPositionAnimator,
): {
    controls: ReturnType<typeof clanMapControls>;
    minimap: ReturnType<typeof clanMapMinimap>;
    names: ReturnType<typeof clanMapNames>;
} {
    return {
        controls: buildSubControls(state, props),
        minimap: buildSubMinimap(state, props),
        names: buildSubNames(state, props, blipAnimator),
    };
}
