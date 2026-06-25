import type { AtlasBox } from "../../../../../shared/types/view-types.js";

export function sameViewport(a: AtlasBox, b: AtlasBox): boolean {
    return a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
}
