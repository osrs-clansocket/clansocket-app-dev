import { onSliced } from "./scheduler-loop.js";
import { loopFlushSync, loopIsFlushing } from "./scheduler-sync.js";

export type { SchedulerCounters } from "./scheduler-counters.js";
export { getSchedulerCounters } from "./scheduler-counters.js";
export { scheduleAttr, scheduleHtml, scheduleText } from "./scheduler-write-api.js";
export { scheduleMeasure, scheduleOp, type OpLane } from "./scheduler-op-api.js";

export function flushSync(): void {
    loopFlushSync(onSliced);
}

export function isFlushing(): boolean {
    return loopIsFlushing();
}
