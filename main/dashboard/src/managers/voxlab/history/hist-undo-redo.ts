import { applyHistoryValue } from "./hist-apply.js";
import type { HistCtx } from "./hist-ctx.js";

export function performUndoAll(ctx: HistCtx): void {
    const entry = ctx.history.popUndo();
    if (!entry) return;
    applyHistoryValue(ctx, entry.path, entry.prevValue);
}

export function performRedoAll(ctx: HistCtx): void {
    const entry = ctx.history.popRedo();
    if (!entry) return;
    applyHistoryValue(ctx, entry.path, entry.nextValue);
}
