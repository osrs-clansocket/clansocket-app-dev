import { Color, Vector3, type BufferAttribute } from "three";
import type { GradientSpec, PaintOverride } from "../../shared/types/voxlab/paint/paint-types.js";
import type { GradientCtx } from "./gradient-ctx.js";
import { computeLinearGradient } from "./gradient-linear.js";
import { computeRadialGradient } from "./gradient-radial.js";

export function gradientMapper(
    positions: BufferAttribute,
    targetVertices: ReadonlySet<number>,
    spec: GradientSpec,
): PaintOverride[] {
    if (targetVertices.size === 0 || spec.stops.length === 0) {
        return [];
    }
    const sortedStops = [...spec.stops].sort((a, b) => a.position - b.position);
    const stopColors = sortedStops.map((s) => new Color(s.color));
    const v = new Vector3();
    const ctx: GradientCtx = { positions, targetVertices, sortedStops, stopColors, scratch: v };
    if (spec.type === "linear") {
        return computeLinearGradient(ctx, spec.axis);
    }
    return computeRadialGradient(ctx);
}
