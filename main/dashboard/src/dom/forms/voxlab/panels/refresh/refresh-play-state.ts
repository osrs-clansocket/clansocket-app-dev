import { TRANSPORT_ICONS } from "../../../../../shared/constants/voxlab/transport-icons.js";
import type { RefreshDeps } from "../timeline/timeline-refresh-types.js";

export function refreshPlayState(deps: RefreshDeps): void {
    const playing = deps.source?.isPlaying ?? false;
    // eslint-disable-next-line lvi/no-raw-dom
    deps.play.el.innerHTML = playing ? TRANSPORT_ICONS.pause : TRANSPORT_ICONS.play;
    deps.play.setAttr("title", playing ? "Pause" : "Play");
    deps.play.setAttr("aria-label", playing ? "Pause" : "Play");
}
