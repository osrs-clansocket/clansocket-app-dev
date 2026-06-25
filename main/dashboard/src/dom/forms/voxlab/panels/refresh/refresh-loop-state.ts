import type { RefreshDeps } from "../timeline/timeline-refresh-types.js";

export function refreshLoopState(deps: RefreshDeps): void {
    deps.loop.setAttr("data-active", (deps.source?.loop ?? false) ? "true" : "false");
}
