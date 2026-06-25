import { pushIdle } from "./scheduler-idle.js";
import { queues } from "./scheduler-queues.js";
import { ensureScheduled } from "./scheduler-loop.js";

export type OpLane = "animation" | "deferred" | "idle";

export function scheduleMeasure(fn: () => void): void {
    queues.measureQueue.push(fn);
    ensureScheduled();
}

export function scheduleOp(op: () => void, lane: OpLane = "animation"): void {
    if (lane === "idle") {
        pushIdle(op);
        return;
    }
    if (lane === "deferred") queues.deferredOps.push(op);
    else queues.animationOps.push(op);
    ensureScheduled();
}
