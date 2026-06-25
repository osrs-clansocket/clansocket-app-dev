import type { GradientAxis, PaintOverride } from "../../shared/types/voxlab/paint/paint-types.js";
import { axisRange, getAxisValue } from "./gradient-axis.js";
import { buildOverride } from "./gradient-override.js";
import type { GradientCtx } from "./gradient-ctx.js";

export function computeLinearGradient(ctx: GradientCtx, axis: GradientAxis): PaintOverride[] {
    const { positions, targetVertices, sortedStops, stopColors, scratch } = ctx;
    const { min, max } = axisRange(positions, targetVertices, axis, scratch);
    const range = max - min;
    if (range === 0) return [];
    const overrides: PaintOverride[] = [];
    for (const idx of targetVertices) {
        scratch.fromBufferAttribute(positions, idx);
        const t = (getAxisValue(scratch, axis) - min) / range;
        overrides.push(buildOverride(idx, t, sortedStops, stopColors));
    }
    return overrides;
}
