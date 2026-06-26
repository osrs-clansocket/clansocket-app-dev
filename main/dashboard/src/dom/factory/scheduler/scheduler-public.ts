import { onSliced } from "./scheduler-ensure.js";
import { loopFlushSync, loopIsFlushing } from "./scheduler-sync.js";

export function flushSync(): void {
    loopFlushSync(onSliced);
}

export function isFlushing(): boolean {
    return loopIsFlushing();
}
