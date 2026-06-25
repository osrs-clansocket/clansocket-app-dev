import type { AtlasBox } from "../../../../shared/types/view-types.js";
import { atlasCacheDims } from "./atlas-state.js";

function clampAxis(start: number, len: number, atlasLen: number): number {
    if (len >= atlasLen) return (atlasLen - len) / 2;
    return Math.max(0, Math.min(atlasLen - len, start));
}

export function clampToAtlas(viewport: AtlasBox): AtlasBox {
    const dims = atlasCacheDims();
    return {
        x: clampAxis(viewport.x, viewport.w, dims.width),
        y: clampAxis(viewport.y, viewport.h, dims.height),
        w: viewport.w,
        h: viewport.h,
    };
}
