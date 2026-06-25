import type { BlipPx } from "../../../../../shared/types/blip-types.js";
import {
    BLIP_RADIUS,
    ENGAGED_RING_LINE_W,
    ENGAGED_RING_RADIUS_OFFSET,
    ENGAGED_RING_STROKE,
    LAST_KNOWN_ALPHA,
    TWO_PI,
} from "../../../../../shared/constants/clan/clan-map-constants.js";

export function paintBlipRings(ctx: CanvasRenderingContext2D, visible: readonly BlipPx[]): void {
    ctx.strokeStyle = ENGAGED_RING_STROKE;
    ctx.lineWidth = ENGAGED_RING_LINE_W;
    for (const blip of visible) {
        if (!blip.engaged) continue;
        ctx.globalAlpha = blip.isActive ? 1 : LAST_KNOWN_ALPHA;
        ctx.beginPath();
        ctx.arc(blip.px, blip.py, BLIP_RADIUS + ENGAGED_RING_RADIUS_OFFSET, 0, TWO_PI);
        ctx.stroke();
    }
}
