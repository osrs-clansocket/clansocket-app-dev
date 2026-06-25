import { TRANSPORT_ICONS } from "../../../../../shared/constants/voxlab/transport-icons.js";
import type { RefreshDeps } from "../timeline/timeline-refresh-types.js";

export function refreshSmoothingState(deps: RefreshDeps): void {
    const smooth = deps.source?.smoothing ?? true;
    // eslint-disable-next-line lvi/no-raw-dom
    deps.smoothing.el.innerHTML = smooth ? TRANSPORT_ICONS.smoothingCurve : TRANSPORT_ICONS.smoothingLinear;
    deps.smoothing.setAttr("data-active", smooth ? "true" : "false");
    const next = smooth ? "linear" : "smooth";
    deps.smoothing.setAttr(
        "title",
        `Interpolation: ${smooth ? "smooth (curve)" : "linear (zigzag)"} — click for ${next}`,
    );
    deps.smoothing.setAttr("aria-label", `Switch to ${next} interpolation`);
}
