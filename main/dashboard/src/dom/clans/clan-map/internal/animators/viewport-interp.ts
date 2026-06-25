import type { AtlasBox } from "../../../../../shared/types/view-types.js";

export function makeViewportInterp(
    clamp: (vp: AtlasBox) => AtlasBox,
    from: AtlasBox,
    to: AtlasBox,
): (eased: number) => AtlasBox {
    return (eased: number) =>
        clamp({
            x: from.x + (to.x - from.x) * eased,
            y: from.y + (to.y - from.y) * eased,
            w: from.w + (to.w - from.w) * eased,
            h: from.h + (to.h - from.h) * eased,
        });
}
