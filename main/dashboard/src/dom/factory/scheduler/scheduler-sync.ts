import { cycleState } from "./scheduler-state.js";
import { runFlush } from "./scheduler-flush-run.js";

export function loopFlushSync(onSliced: () => void): void {
    if (cycleState.scheduled) {
        cancelAnimationFrame(cycleState.rafHandle);
        cycleState.scheduled = false;
    }
    if (cycleState.flushing) return;
    runFlush(false, onSliced);
}

export function loopIsFlushing(): boolean {
    return cycleState.flushing;
}
