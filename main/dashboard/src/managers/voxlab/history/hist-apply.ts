import { applyByPath } from "../../../voxlab/timeline/property-paths.js";
import type { HistCtx } from "./hist-ctx.js";
import { persistIfAllowed } from "./hist-ctx.js";

export function applyHistoryValue(ctx: HistCtx, path: string, value: unknown): void {
    const current = ctx.snapshot.capture();
    applyByPath(current, path, value);
    ctx.history.suspend();
    ctx.snapshot.restore(current);
    ctx.history.resume();
    ctx.history.syncPrevious(current);
    persistIfAllowed(ctx, current);
}
