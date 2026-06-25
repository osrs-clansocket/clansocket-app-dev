import { Color } from "three";
import { RGB_STRIDE } from "../../../../shared/constants/voxlab/texture-paint-constants.js";
import type { MeshPart } from "../../../../shared/types/voxlab/paint/paint-types.js";
import { PART_ORDER } from "../paint-manager-types.js";
import { requireColorAttribute, type ApplyCtx } from "./apply-ctx.js";

export function fillPartBuffer(ctx: ApplyCtx, part: MeshPart, color: string, dest: Float32Array): void {
    const range = ctx.rangeOf(part);
    if (!range) return;
    const c = new Color(color);
    for (const v of range.vertices) {
        const base = v * RGB_STRIDE;
        dest[base] = c.r;
        dest[base + 1] = c.g;
        dest[base + 2] = c.b;
    }
}

export function applyAllPaint(ctx: ApplyCtx): void {
    if (!ctx.baselineColors) return;
    const colorAttr = requireColorAttribute(ctx.meshes);
    if (!colorAttr) return;
    const dest = colorAttr.array as Float32Array;
    dest.set(ctx.baselineColors);
    for (const part of PART_ORDER) {
        const color = ctx.partsState[part];
        if (color !== null) fillPartBuffer(ctx, part, color, dest);
    }
    for (const [vertexIndex, rgb] of ctx.overridesMap) {
        const base = vertexIndex * RGB_STRIDE;
        dest[base] = rgb[0];
        dest[base + 1] = rgb[1];
        dest[base + 2] = rgb[2];
    }
    colorAttr.needsUpdate = true;
}
