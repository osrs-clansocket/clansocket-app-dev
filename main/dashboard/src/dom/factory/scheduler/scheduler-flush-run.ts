import { flushOps, flushWrites } from "./scheduler-flush.js";
import { counters } from "./scheduler-counters.js";
import { pendingCount, queues } from "./scheduler-queues.js";
import { cycleState } from "./scheduler-state.js";

const FRAME_BUDGET_MS = 8;

function clock(): number {
    return performance.now();
}

export function runFlush(budgeted: boolean, onSliced: () => void): void {
    cycleState.flushing = true;
    const start = clock();
    try {
        const writes = flushWrites(queues);
        counters.commitSize = writes + flushOps({ frameBudgetMs: FRAME_BUDGET_MS, queues, budgeted, clock, onSliced });
    } finally {
        cycleState.flushing = false;
        counters.frameMs = clock() - start;
        counters.queueDepth = pendingCount();
    }
}
