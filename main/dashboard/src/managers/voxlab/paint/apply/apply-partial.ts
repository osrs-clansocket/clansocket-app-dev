import { RGB_STRIDE } from "../../../../shared/constants/voxlab/texture-paint-constants.js";
import { type ApplyCtx, requireColorAttribute } from "./apply-ctx.js";
import { buildPartLookup, resolveVertexColor } from "./apply-color-resolver.js";

export function applyPartial(ctx: ApplyCtx, changedVertices: Iterable<number>): void {
    if (!ctx.baselineColors) return;
    const colorAttr = requireColorAttribute(ctx.meshes);
    if (!colorAttr) return;
    const arr = colorAttr.array as Float32Array;
    const baseline = ctx.baselineColors;
    const { partColors, partRanges } = buildPartLookup(ctx);
    let minV = Infinity;
    let maxV = -Infinity;
    for (const v of changedVertices) {
        const [r, g, b] = resolveVertexColor({ overridesMap: ctx.overridesMap, v, baseline, partColors, partRanges });
        const base = v * RGB_STRIDE;
        arr[base] = r;
        arr[base + 1] = g;
        arr[base + 2] = b;
        if (v < minV) minV = v;
        if (v > maxV) maxV = v;
    }
    if (minV !== Infinity)
        colorAttr.updateRanges = [{ start: minV * RGB_STRIDE, count: (maxV - minV + 1) * RGB_STRIDE }];
    colorAttr.needsUpdate = true;
}
