import type { MeshPart } from "../../../shared/types/voxlab/paint/paint-types.js";
import { PART_ORDER, type StrokeDelta, type VertexRange } from "../paint/paint-manager-types.js";

export function collectAffectedVertices(delta: StrokeDelta, rangeOf: (p: MeshPart) => VertexRange | null): Set<number> {
    const changed = new Set<number>();
    for (const v of delta.overrides.keys()) changed.add(v);
    for (const part of PART_ORDER) {
        if (delta.parts[part] === undefined) continue;
        const range = rangeOf(part);
        if (range) for (const v of range.vertices) changed.add(v);
    }
    return changed;
}
