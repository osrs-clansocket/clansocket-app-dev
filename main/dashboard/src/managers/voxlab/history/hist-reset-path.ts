import { applyByPath, readByPath } from "../../../voxlab/timeline/property-paths.js";
import type { HistCtx } from "./hist-ctx.js";
import { persistIfAllowed } from "./hist-ctx.js";

export function performResetPath(ctx: HistCtx, path: string): void {
    const baseline = ctx.history.getBaseline();
    if (!baseline) return;
    const defaultValue = readByPath(baseline, path);
    if (defaultValue === undefined) return;
    const current = ctx.snapshot.capture();
    applyByPath(current, path, defaultValue);
    ctx.history.resetPathEntries(path);
    ctx.history.suspend();
    ctx.snapshot.restore(current);
    ctx.history.resume();
    ctx.history.syncPrevious(current);
    persistIfAllowed(ctx, current);
}
