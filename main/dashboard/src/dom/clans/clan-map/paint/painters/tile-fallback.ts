import type { PaintTilesOpts } from "../../../../../shared/types/paint-types.js";
import { ancestorChildDraws } from "../finders/fallback-tile-finder.js";
import type { PaintTileRect } from "./tile-rect-types.js";

export type { PaintTileRect } from "./tile-rect-types.js";

interface FallbackArgs {
    ctx: CanvasRenderingContext2D;
    plane: number;
    zoom: number;
    tx: number;
    ty: number;
    cache: PaintTilesOpts["cache"];
    rect: PaintTileRect;
}

export function paintTileFallbacks(a: FallbackArgs): void {
    const children = ancestorChildDraws({ plane: a.plane, zoom: a.zoom, tx: a.tx, ty: a.ty, cache: a.cache });
    if (children.length === 0) return;
    const { rect, ctx } = a;
    const halfWFloor = Math.floor(rect.dw / 2);
    const halfHFloor = Math.floor(rect.dh / 2);
    const halfWCeil = rect.dw - halfWFloor;
    const halfHCeil = rect.dh - halfHFloor;
    for (const child of children) {
        const isRight = (child.quad & 1) !== 0;
        const isBottom = child.quad >> 1 !== 0;
        const qx = isRight ? halfWFloor : 0;
        const qy = isBottom ? halfHFloor : 0;
        const qw = isRight ? halfWCeil : halfWFloor;
        const qh = isBottom ? halfHCeil : halfHFloor;
        ctx.drawImage(child.img, rect.dx + qx, rect.dy + qy, qw, qh);
    }
}
