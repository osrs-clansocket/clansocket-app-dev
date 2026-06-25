import type { PaintOverride } from "../../shared/types/voxlab/paint/paint-types.js";
import { axisCenterMass, axisMaxRadius } from "./gradient-axis.js";
import { buildOverride } from "./gradient-override.js";
import type { GradientCtx } from "./gradient-ctx.js";

export function computeRadialGradient(ctx: GradientCtx): PaintOverride[] {
    const { positions, targetVertices, sortedStops, stopColors, scratch } = ctx;
    const center = axisCenterMass(positions, targetVertices, scratch);
    const maxDist = axisMaxRadius(positions, targetVertices, center, scratch);
    if (maxDist === 0) return [];
    const overrides: PaintOverride[] = [];
    for (const idx of targetVertices) {
        scratch.fromBufferAttribute(positions, idx);
        const dx = scratch.x - center.x;
        const dy = scratch.y - center.y;
        const dz = scratch.z - center.z;
        const t = Math.sqrt(dx * dx + dy * dy + dz * dz) / maxDist;
        overrides.push(buildOverride(idx, t, sortedStops, stopColors));
    }
    return overrides;
}
