import { counters } from "./scheduler-counters.js";
import { ensureScheduled } from "./scheduler-ensure.js";

export function onSliced(): void {
    counters.slicedCommits++;
    ensureScheduled();
}
