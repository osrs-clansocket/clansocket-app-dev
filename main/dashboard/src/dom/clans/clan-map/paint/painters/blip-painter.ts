import type { PaintBlipsOpts } from "../../../../../shared/types/paint-types.js";
import {
    BLIP_FILL,
    BLIP_STROKE,
    BLIP_STROKE_W,
    LAST_KNOWN_ALPHA,
} from "../../../../../shared/constants/clan/clan-map-constants.js";
import { paintBlipShape } from "./blip-painter-shape.js";
import { paintBlipPulses } from "./blip-painter-pulse.js";
import { paintBlipRings } from "./blip-painter-rings.js";

export function paintBlips({ ctx, w, h, blips, alertedHashes, showLastKnown }: PaintBlipsOpts): void {
    ctx.clearRect(0, 0, w, h);
    const visible = showLastKnown ? blips : blips.filter((b) => b.isActive);
    if (alertedHashes.size > 0) paintBlipPulses(ctx, visible, alertedHashes);
    paintBlipRings(ctx, visible);
    ctx.fillStyle = BLIP_FILL;
    ctx.strokeStyle = BLIP_STROKE;
    ctx.lineWidth = BLIP_STROKE_W;
    for (const blip of visible) {
        ctx.globalAlpha = blip.isActive ? 1 : LAST_KNOWN_ALPHA;
        paintBlipShape(ctx, blip);
        ctx.fill();
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}
