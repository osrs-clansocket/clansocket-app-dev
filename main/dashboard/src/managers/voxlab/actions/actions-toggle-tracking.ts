import type { ActionsCtx } from "./actions-ctx.js";

export function runToggleTracking(ctx: ActionsCtx): void {
    const next = !ctx.recorder.isEnabled();
    ctx.recorder.setEnabled(next);
    ctx.timelinePanel.setTrackingActive(next);
}
