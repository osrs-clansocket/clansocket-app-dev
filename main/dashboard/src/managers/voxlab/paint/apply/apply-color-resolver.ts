import { Color } from "three";
import { RGB_STRIDE } from "../../../../shared/constants/voxlab/texture-paint-constants.js";
import { PART_ORDER, type RgbTuple, type VertexRange } from "../paint-manager-types.js";
import type { ApplyCtx } from "./apply-ctx.js";

export function buildPartLookup(ctx: ApplyCtx): {
    partColors: Array<RgbTuple | null>;
    partRanges: Array<VertexRange | null>;
} {
    const partColors: Array<RgbTuple | null> = [null, null, null];
    const partRanges: Array<VertexRange | null> = [null, null, null];
    for (let i = 0; i < PART_ORDER.length; i++) {
        const color = ctx.partsState[PART_ORDER[i]];
        if (color !== null) {
            const c = new Color(color);
            partColors[i] = [c.r, c.g, c.b];
            partRanges[i] = ctx.rangeOf(PART_ORDER[i]);
        }
    }
    return { partColors, partRanges };
}

function partColorFor(
    v: number,
    partColors: Array<RgbTuple | null>,
    partRanges: Array<VertexRange | null>,
): RgbTuple | null {
    for (let i = 0; i < PART_ORDER.length; i++) {
        const partColor = partColors[i];
        const partRange = partRanges[i];
        if (partColor !== null && partRange !== null && partRange.vertices.has(v)) return partColor;
    }
    return null;
}

export interface ResolveColorArgs {
    v: number;
    baseline: Float32Array;
    overridesMap: Map<number, RgbTuple>;
    partColors: Array<RgbTuple | null>;
    partRanges: Array<VertexRange | null>;
}

export function resolveVertexColor(args: ResolveColorArgs): RgbTuple {
    const { v, baseline, overridesMap, partColors, partRanges } = args;
    const base = v * RGB_STRIDE;
    const partColor = partColorFor(v, partColors, partRanges);
    const override = overridesMap.get(v);
    if (override !== undefined) return [override[0], override[1], override[2]];
    if (partColor !== null) return [partColor[0], partColor[1], partColor[2]];
    return [baseline[base], baseline[base + 1], baseline[base + 2]];
}
