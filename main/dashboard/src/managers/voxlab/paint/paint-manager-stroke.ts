import { type BufferAttribute, Color, type Vector3 } from "three";
import { RGB_STRIDE } from "../../../shared/constants/voxlab/texture-paint-constants.js";
import type { BrushState } from "../../../shared/types/voxlab/paint/paint-types.js";
import type { VertexHashGrid } from "../../../voxlab/mappers/brush-mapper.js";
import type { MeshManager } from "../mesh/mesh-manager.js";
import type { ViewportManager } from "../viewport/viewport-manager.js";
import { blendHits, brushHitsPoint, gatherBrushSymmetry } from "./paint-manager-brush.js";
import { requireColorAttribute } from "./paint-manager-apply.js";
import { backFaceArgs } from "./stroke-back-face.js";
import type { RgbTuple, StrokeDelta } from "./paint-manager-types.js";

export interface StrokeCtx {
    meshes: MeshManager;
    viewport: ViewportManager;
    brush: BrushState;
    brushColor: Color;
    symmetryPoints: Vector3[];
    vertexGrid: VertexHashGrid | null;
    baselineColors: Float32Array | null;
    currentStrokeDelta: StrokeDelta | null;
    strokeBuffer: Map<number, RgbTuple>;
    overridesMap: Map<number, RgbTuple>;
}

export interface CommitCtx {
    strokeBuffer: Map<number, RgbTuple>;
    overridesMap: Map<number, RgbTuple>;
    currentStrokeDeltaRef: { v: StrokeDelta | null };
    pushDelta: (delta: StrokeDelta) => void;
    emit: () => void;
}

export function commitStrokeFn(ctx: CommitCtx): void {
    if (ctx.strokeBuffer.size === 0) {
        ctx.currentStrokeDeltaRef.v = null;
        return;
    }
    const delta = ctx.currentStrokeDeltaRef.v;
    for (const [v, rgb] of ctx.strokeBuffer) {
        ctx.overridesMap.set(v, rgb);
        if (delta) {
            const entry = delta.overrides.get(v);
            if (entry) entry[1] = rgb;
        }
    }
    ctx.strokeBuffer.clear();
    if (delta && delta.overrides.size > 0) ctx.pushDelta(delta);
    ctx.currentStrokeDeltaRef.v = null;
    ctx.emit();
}

function blendCtxHits(
    ctx: StrokeCtx,
    arr: Float32Array,
    hits: ReturnType<typeof brushHitsPoint>,
): { minV: number; maxV: number } {
    return blendHits({
        hits,
        arr,
        brushColor: ctx.brushColor,
        brushMode: ctx.brush.mode,
        brushOpacity: ctx.brush.opacity,
        baseline: ctx.baselineColors,
        delta: ctx.currentStrokeDelta,
        strokeBuffer: ctx.strokeBuffer,
        overridesMap: ctx.overridesMap,
    });
}

function blendSinglePoint(args: {
    ctx: StrokeCtx;
    back: ReturnType<typeof backFaceArgs>;
    positions: BufferAttribute;
    arr: Float32Array;
    p: Vector3;
}): { minV: number; maxV: number } | null {
    const { ctx, back, positions, arr, p } = args;
    const hits = brushHitsPoint(ctx.brush, ctx.vertexGrid, {
        positions,
        p,
        normals: back.normals,
        cameraPos: back.cameraPos,
    });
    if (hits.length === 0) return null;
    return blendCtxHits(ctx, arr, hits);
}

export function applyBrushStroke(ctx: StrokeCtx, worldPoint: Vector3): void {
    const mesh = ctx.meshes.mesh;
    if (!mesh) return;
    const positions = mesh.geometry.getAttribute("position") as BufferAttribute | undefined;
    if (!positions) return;
    const colorAttr = requireColorAttribute(ctx.meshes);
    if (!colorAttr) return;
    const back = backFaceArgs(ctx.brush, ctx.viewport, mesh);
    const arr = colorAttr.array as Float32Array;
    const pointCount = gatherBrushSymmetry(worldPoint, ctx.brush, ctx.symmetryPoints);
    let minV = Infinity;
    let maxV = -Infinity;
    for (let i = 0; i < pointCount; i++) {
        const range = blendSinglePoint({ ctx, back, positions, arr, p: ctx.symmetryPoints[i] });
        if (range === null) continue;
        if (range.minV < minV) minV = range.minV;
        if (range.maxV > maxV) maxV = range.maxV;
    }
    if (minV !== Infinity)
        colorAttr.updateRanges = [{ start: minV * RGB_STRIDE, count: (maxV - minV + 1) * RGB_STRIDE }];
    colorAttr.needsUpdate = true;
}
