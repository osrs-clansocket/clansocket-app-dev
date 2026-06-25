import { MAX_ZOOM, MIN_ZOOM } from "../../../../../shared/constants/clan/clan-map-constants.js";
import type { TileCache } from "../caches/tile-cache.js";
import { tileUrl } from "../formatters/tile-url-formatter.js";

const TILE_SOURCE_PX = 256;
const QUAD_COUNT = 4;

export interface AncestorDraw {
    img: HTMLImageElement;
    srcX: number;
    srcY: number;
    srcSize: number;
}

export interface AncestorChildDraw {
    img: HTMLImageElement;
    quad: number;
}

export interface AncestorCoord {
    plane: number;
    zoom: number;
    tx: number;
    ty: number;
    cache: TileCache;
}

interface AncestorImgArgs {
    plane: number;
    ancZoom: number;
    ancTx: number;
    ancTy: number;
    cache: TileCache;
}

function ancestorImg(args: AncestorImgArgs): HTMLImageElement | null {
    const { plane, ancZoom, ancTx, ancTy, cache } = args;
    const img = cache.get(tileUrl(plane, ancZoom, ancTx, ancTy));
    if (img === undefined || !img.complete || img.naturalWidth === 0) return null;
    return img;
}

export function ancestorDraw(coord: AncestorCoord, maxLevels: number): AncestorDraw | null {
    const { plane, zoom, tx, ty, cache } = coord;
    for (let scaleDiff = 1; scaleDiff <= maxLevels; scaleDiff++) {
        const ancZoom = zoom - scaleDiff;
        if (ancZoom < MIN_ZOOM) return null;
        const img = ancestorImg({ plane, ancZoom, cache, ancTx: tx >> scaleDiff, ancTy: ty >> scaleDiff });
        if (img === null) continue;
        const mask = (1 << scaleDiff) - 1;
        const srcSize = TILE_SOURCE_PX >> scaleDiff;
        return { img, srcSize, srcX: (tx & mask) * srcSize, srcY: (ty & mask) * srcSize };
    }
    return null;
}

export function ancestorChildDraws(coord: AncestorCoord): AncestorChildDraw[] {
    const { plane, zoom, tx, ty, cache } = coord;
    if (zoom + 1 > MAX_ZOOM) return [];
    const draws: AncestorChildDraw[] = [];
    for (let q = 0; q < QUAD_COUNT; q++) {
        const childTx = 2 * tx + (q & 1);
        const childTy = 2 * ty + (q >> 1);
        const url = tileUrl(plane, zoom + 1, childTx, childTy);
        const img = cache.get(url);
        if (img !== undefined && img.complete && img.naturalWidth > 0) {
            draws.push({ img, quad: q });
        }
    }
    return draws;
}
