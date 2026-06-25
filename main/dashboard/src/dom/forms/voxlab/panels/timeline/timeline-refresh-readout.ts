import type { Instance } from "../../../../factory/index.js";
import { MS_PER_SECOND, SCRUB_MAX } from "./timeline-component-types.js";
import type { RefreshDeps } from "./timeline-refresh-types.js";

export function refreshReadout(timeReadout: Instance, timeMs: number, durationMs: number): void {
    timeReadout.setText(`${(timeMs / MS_PER_SECOND).toFixed(2)}s / ${(durationMs / MS_PER_SECOND).toFixed(2)}s`);
}

export function applyCursor(deps: RefreshDeps, timeMs: number): void {
    const duration = deps.source?.durationMs ?? 0;
    deps.scrubber.el.value = duration > 0 ? String(Math.round((timeMs / duration) * SCRUB_MAX)) : "0";
    refreshReadout(deps.timeReadout, timeMs, duration);
}
