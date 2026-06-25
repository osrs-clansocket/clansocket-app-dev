import { isHidden } from "../../../managers/raf.js";
import { drainIdleFallback, initIdle } from "./scheduler-idle.js";
import { bindVisibility } from "./scheduler-visibility.js";
import { pendingCount, queues } from "./scheduler-queues.js";
import { cycleState } from "./scheduler-state.js";
import { runFlush } from "./scheduler-flush-run.js";
import { onSliced } from "./scheduler-sliced.js";

initIdle(() => {
    drainIdleFallback(queues.deferredOps);
    ensureScheduled();
});

function onFrame(): void {
    cycleState.scheduled = false;
    if (isHidden()) return;
    runFlush(true, onSliced);
}

export function ensureScheduled(): void {
    bindVisibility(() => {
        if (pendingCount() > 0) ensureScheduled();
    });
    if (cycleState.scheduled || cycleState.flushing) return;
    cycleState.scheduled = true;
    cycleState.rafHandle = requestAnimationFrame(onFrame);
}
