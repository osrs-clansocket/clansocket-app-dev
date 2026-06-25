import type { BlipPx } from "../../../../../shared/types/blip-types.js";
import { LAST_KNOWN_ALPHA } from "../../../../../shared/constants/clan/clan-map-constants.js";
import { drawPulse } from "./pulse-painter.js";

export function paintBlipPulses(
    ctx: CanvasRenderingContext2D,
    visible: readonly BlipPx[],
    alertedHashes: ReadonlySet<string>,
): void {
    const nowMs = performance.now();
    for (const blip of visible) {
        if (!alertedHashes.has(blip.accountHash)) continue;
        ctx.globalAlpha = blip.isActive ? 1 : LAST_KNOWN_ALPHA;
        drawPulse({ ctx, nowMs, px: blip.px, py: blip.py });
    }
}
