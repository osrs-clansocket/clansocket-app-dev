import type {
    GradientApply,
    GradientTarget,
    MeshPart,
    PartsPaintState,
} from "../../../shared/types/voxlab/paint/paint-types.js";
import type { BufferAttribute } from "three";
import { gradientMapper } from "../../../voxlab/mappers/gradient-mapper.js";
import type { MeshManager } from "../mesh/mesh-manager.js";
import { PART_ORDER, type RgbTuple, type StrokeDelta, type VertexRange } from "./paint-manager-types.js";

export interface PartsCtx {
    partsState: PartsPaintState;
    overridesMap: Map<number, RgbTuple>;
    rangeOf: (part: MeshPart) => VertexRange | null;
    pushDelta: (delta: StrokeDelta) => void;
    applyAll: () => void;
    applyChanged: (verts: Iterable<number>) => void;
    emit: () => void;
}

export function fillPart(ctx: PartsCtx, part: MeshPart, color: string): void {
    const delta: StrokeDelta = { overrides: new Map(), parts: {} };
    delta.parts[part] = [ctx.partsState[part], color];
    ctx.pushDelta(delta);
    ctx.partsState[part] = color;
    const range = ctx.rangeOf(part);
    if (range) ctx.applyChanged(range.vertices);
    else ctx.applyAll();
    ctx.emit();
}

export function resetPart(ctx: PartsCtx, part: MeshPart): void {
    const delta: StrokeDelta = { overrides: new Map(), parts: {} };
    delta.parts[part] = [ctx.partsState[part], null];
    const range = ctx.rangeOf(part);
    if (range)
        for (const v of range.vertices) {
            const existing = ctx.overridesMap.get(v);
            if (existing) delta.overrides.set(v, [[existing[0], existing[1], existing[2]], null]);
        }
    ctx.pushDelta(delta);
    ctx.partsState[part] = null;
    if (range) {
        for (const v of range.vertices) ctx.overridesMap.delete(v);
        ctx.applyChanged(range.vertices);
    } else ctx.applyAll();
    ctx.emit();
}

export function clearAllPaint(
    ctx: PartsCtx,
    defaults: PartsPaintState,
    setPartsState: (s: PartsPaintState) => void,
): void {
    const delta: StrokeDelta = { overrides: new Map(), parts: {} };
    for (const part of PART_ORDER) if (ctx.partsState[part] !== null) delta.parts[part] = [ctx.partsState[part], null];
    for (const [v, rgb] of ctx.overridesMap) delta.overrides.set(v, [[rgb[0], rgb[1], rgb[2]], null]);
    ctx.pushDelta(delta);
    setPartsState({ ...defaults });
    ctx.overridesMap.clear();
    ctx.applyAll();
    ctx.emit();
}

export interface GradientCtx extends PartsCtx {
    meshes: MeshManager;
}

function getTargetVertices(
    target: GradientTarget,
    totalCount: number,
    rangeOf: (p: MeshPart) => VertexRange | null,
): Set<number> {
    if (target === "all") {
        const all = new Set<number>();
        for (let i = 0; i < totalCount; i++) all.add(i);
        return all;
    }
    return rangeOf(target)?.vertices ?? new Set();
}

export function applyGradient(ctx: GradientCtx, spec: GradientApply): void {
    const mesh = ctx.meshes.mesh;
    if (!mesh) return;
    const positions = mesh.geometry.getAttribute("position") as BufferAttribute | undefined;
    if (!positions) return;
    const targetVertices = getTargetVertices(spec.target, positions.count, ctx.rangeOf);
    if (targetVertices.size === 0) return;
    const overrides = gradientMapper(positions, targetVertices, spec);
    const delta: StrokeDelta = { overrides: new Map(), parts: {} };
    for (const o of overrides) {
        const before = ctx.overridesMap.get(o.vertexIndex);
        const newRgb: RgbTuple = [o.rgb[0], o.rgb[1], o.rgb[2]];
        delta.overrides.set(o.vertexIndex, [before ? [before[0], before[1], before[2]] : null, newRgb]);
        ctx.overridesMap.set(o.vertexIndex, newRgb);
    }
    ctx.pushDelta(delta);
    if (spec.target === "all") ctx.applyAll();
    else ctx.applyChanged(targetVertices);
    ctx.emit();
}
