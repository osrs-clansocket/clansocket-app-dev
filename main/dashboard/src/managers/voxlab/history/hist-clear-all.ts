import type { HistCtx } from "./hist-ctx.js";
import { persistIfAllowed } from "./hist-ctx.js";

export function performClearAll(ctx: HistCtx): void {
    const baseline = ctx.history.getBaseline();
    if (!baseline) return;
    ctx.history.suspend();
    ctx.snapshot.restore(baseline);
    ctx.history.resume();
    ctx.history.clearAll();
    ctx.history.syncPrevious(baseline);
    persistIfAllowed(ctx, baseline);
}
