import { RGB_STRIDE } from "../../../../shared/constants/voxlab/texture-paint-constants.js";
import type { RgbTuple, StrokeDelta } from "../paint-manager-types.js";

function recordDeltaBefore(delta: StrokeDelta, v: number, overridesMap: Map<number, RgbTuple>): void {
    if (delta.overrides.has(v)) return;
    const before = overridesMap.get(v);
    delta.overrides.set(v, [before ? [before[0], before[1], before[2]] : null, null]);
}

interface BlendOneArgs {
    hit: { vertexIndex: number; weight: number };
    arr: Float32Array;
    targetRgb: [number, number, number];
    isErase: boolean;
    baseline: Float32Array | null;
    delta: StrokeDelta | null;
    brushOpacity: number;
    strokeBuffer: Map<number, RgbTuple>;
    overridesMap: Map<number, RgbTuple>;
}

export function blendOneHit(args: BlendOneArgs): number {
    const { hit, arr, targetRgb, isErase, baseline, delta, brushOpacity, strokeBuffer, overridesMap } = args;
    const blendWeight = hit.weight * brushOpacity;
    const v = hit.vertexIndex;
    const base = v * RGB_STRIDE;
    const useBaseline = isErase && baseline !== null;
    const tR = useBaseline ? baseline![base] : targetRgb[0];
    const tG = useBaseline ? baseline![base + 1] : targetRgb[1];
    const tB = useBaseline ? baseline![base + 2] : targetRgb[2];
    arr[base] += (tR - arr[base]) * blendWeight;
    arr[base + 1] += (tG - arr[base + 1]) * blendWeight;
    arr[base + 2] += (tB - arr[base + 2]) * blendWeight;
    strokeBuffer.set(v, [arr[base], arr[base + 1], arr[base + 2]]);
    if (delta) recordDeltaBefore(delta, v, overridesMap);
    return v;
}
