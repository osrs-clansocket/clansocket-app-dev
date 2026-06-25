import type { FlushQueues } from "./scheduler-flush.js";

export const queues: FlushQueues = {
    measureQueue: [],
    textQueue: new Map(),
    htmlQueue: new Map(),
    attrQueue: new Map(),
    animationOps: [],
    deferredOps: [],
};

export function pendingCount(): number {
    return (
        queues.measureQueue.length +
        queues.textQueue.size +
        queues.htmlQueue.size +
        queues.attrQueue.size +
        queues.animationOps.length +
        queues.deferredOps.length
    );
}
