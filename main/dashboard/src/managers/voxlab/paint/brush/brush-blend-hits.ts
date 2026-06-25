import { type Color } from "three";
import type { RgbTuple, StrokeDelta } from "../paint-manager-types.js";
import { blendOneHit } from "./brush-blend-one.js";

export interface BlendHitsArgs {
    hits: ReadonlyArray<{ vertexIndex: number; weight: number }>;
    arr: Float32Array;
    brushColor: Color;
    brushMode: string;
    brushOpacity: number;
    baseline: Float32Array | null;
    delta: StrokeDelta | null;
    strokeBuffer: Map<number, RgbTuple>;
    overridesMap: Map<number, RgbTuple>;
}

export function blendHits(args: BlendHitsArgs): { minV: number; maxV: number } {
    const { hits, arr, brushColor, brushMode, brushOpacity, baseline, delta, strokeBuffer, overridesMap } = args;
    const targetRgb: [number, number, number] = [brushColor.r, brushColor.g, brushColor.b];
    const isErase = brushMode === "erase";
    let minV = Infinity,
        maxV = -Infinity;
    for (const hit of hits) {
        const v = blendOneHit({
            hit,
            arr,
            targetRgb,
            isErase,
            baseline,
            delta,
            brushOpacity,
            strokeBuffer,
            overridesMap,
        });
        if (v < minV) minV = v;
        if (v > maxV) maxV = v;
    }
    return { minV, maxV };
}
