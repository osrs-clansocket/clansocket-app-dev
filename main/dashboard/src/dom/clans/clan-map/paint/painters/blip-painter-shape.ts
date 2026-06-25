import type { BlipPx } from "../../../../../shared/types/blip-types.js";
import { BLIP_RADIUS, HEX_VERTICES, TWO_PI } from "../../../../../shared/constants/clan/clan-map-constants.js";

const HEX_ANGLE_STEP = TWO_PI / HEX_VERTICES;

export function paintBlipShape(ctx: CanvasRenderingContext2D, blip: BlipPx): void {
    ctx.beginPath();
    if (blip.isActive) {
        ctx.arc(blip.px, blip.py, BLIP_RADIUS, 0, TWO_PI);
        return;
    }
    for (let i = 0; i < HEX_VERTICES; i++) {
        const angle = HEX_ANGLE_STEP * i;
        const x = blip.px + BLIP_RADIUS * Math.cos(angle);
        const y = blip.py + BLIP_RADIUS * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
}
