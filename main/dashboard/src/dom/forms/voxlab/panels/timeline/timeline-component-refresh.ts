import { TRANSPORT_ICONS } from "../../../../../shared/constants/voxlab/transport-icons.js";
import { refreshMarkers } from "./timeline-marker-build.js";
import { applyCursor, refreshReadout } from "./timeline-refresh-readout.js";
import { refreshLoopState, refreshPlayState, refreshSmoothingState } from "./timeline-refresh-controls.js";
import type { RefreshDeps } from "./timeline-refresh-types.js";

export { refreshMarkers } from "./timeline-marker-build.js";
export { applyCursor, refreshReadout } from "./timeline-refresh-readout.js";
export { refreshLoopState, refreshPlayState, refreshSmoothingState } from "./timeline-refresh-controls.js";
export type { RefreshDeps } from "./timeline-refresh-types.js";

export function applyRefresh(deps: RefreshDeps, doRefreshMarkers: () => void): void {
    if (deps.source?.hasTimeline()) {
        applyCursor(deps, deps.source.currentTimeMs);
        refreshPlayState(deps);
        refreshLoopState(deps);
        refreshSmoothingState(deps);
        doRefreshMarkers();
    } else {
        deps.scrubber.el.value = "0";
        refreshReadout(deps.timeReadout, 0, 0);
        // eslint-disable-next-line lvi/no-raw-dom
        deps.play.el.innerHTML = TRANSPORT_ICONS.play;
        deps.loop.setAttr("data-active", "false");
        // eslint-disable-next-line lvi/no-raw-dom
        deps.smoothing.el.innerHTML = TRANSPORT_ICONS.smoothingCurve;
        deps.smoothing.setAttr("data-active", "false");
        deps.markerRail.clear();
    }
}

void refreshMarkers;
