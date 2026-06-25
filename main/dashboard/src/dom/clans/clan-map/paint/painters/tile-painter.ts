import type { PaintTilesOpts } from "../../../../../shared/types/paint-types.js";
import { BG_FILL } from "../../../../../shared/constants/clan/clan-map-constants.js";
import { pickZoom } from "../pickers/zoom-picker.js";
import { computeTileRange } from "../calculators/tile-range-calculator.js";
import { ensureTile } from "../caches/tile-cache.js";
import { tileVisible } from "../validators/tile-visibility-validator.js";
import { ancestorDraw } from "../finders/fallback-tile-finder.js";
import { paintTileFallbacks, type PaintTileRect } from "./tile-fallback.js";

const MIN_DRAW_PX = 2;
const MAX_FALLBACK_LEVELS = 4;

function paintTileRect(tx: number, ty: number, tileWorldSize: number, view: PaintTilesOpts["view"]): PaintTileRect {
    const worldX = tx * tileWorldSize;
    const worldY = ty * tileWorldSize;
    const dx = Math.round(worldX * view.scale + view.offsetX);
    const dy = Math.round(worldY * view.scale + view.offsetY);
    const dxNext = Math.round((worldX + tileWorldSize) * view.scale + view.offsetX);
    const dyNext = Math.round((worldY + tileWorldSize) * view.scale + view.offsetY);
    return { dx, dy, dw: dxNext - dx, dh: dyNext - dy };
}

interface PaintOneArgs {
    opts: PaintTilesOpts;
    zoom: number;
    tx: number;
    ty: number;
    tileWorldSize: number;
}

function paintOneTile(p: PaintOneArgs): void {
    const { opts, zoom, tx, ty, tileWorldSize } = p;
    if (tx < 0 || ty < 0) return;
    const rect = paintTileRect(tx, ty, tileWorldSize, opts.view);
    if (rect.dw < MIN_DRAW_PX || rect.dh < MIN_DRAW_PX) return;
    if (!tileVisible({ dx: rect.dx, dy: rect.dy, dw: rect.dw, dh: rect.dh, canvasW: opts.w, canvasH: opts.h })) return;
    const img = ensureTile({ zoom, tx, ty, plane: opts.plane, cache: opts.cache, onReady: opts.onTileReady });
    if (img.complete && img.naturalWidth > 0) {
        opts.ctx.drawImage(img, rect.dx, rect.dy, rect.dw, rect.dh);
        return;
    }
    const anc = ancestorDraw({ zoom, tx, ty, plane: opts.plane, cache: opts.cache }, MAX_FALLBACK_LEVELS);
    if (anc !== null) {
        opts.ctx.drawImage(anc.img, anc.srcX, anc.srcY, anc.srcSize, anc.srcSize, rect.dx, rect.dy, rect.dw, rect.dh);
    }
    paintTileFallbacks({ zoom, tx, ty, rect, ctx: opts.ctx, plane: opts.plane, cache: opts.cache });
}

export function paintTiles(opts: PaintTilesOpts): void {
    opts.ctx.fillStyle = BG_FILL;
    opts.ctx.fillRect(0, 0, opts.w, opts.h);
    opts.ctx.imageSmoothingEnabled = true;
    opts.ctx.imageSmoothingQuality = "high";
    const zoom = pickZoom(opts.view.scale);
    const range = computeTileRange(opts.viewport, zoom);
    for (let ty = range.tyMin; ty <= range.tyMax; ty++) {
        for (let tx = range.txMin; tx <= range.txMax; tx++) {
            paintOneTile({ opts, zoom, tx, ty, tileWorldSize: range.tileWorldSize });
        }
    }
}
