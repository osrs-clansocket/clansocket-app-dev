import type { Color } from "three";
import type { GradientStop, PaintOverride } from "../../shared/types/voxlab/paint/paint-types.js";

function colorOverride(vertexIndex: number, c: Color): PaintOverride {
    return { vertexIndex, rgb: [c.r, c.g, c.b] };
}

interface StopInterpArgs {
    vertexIndex: number;
    t: number;
    a: GradientStop;
    b: GradientStop;
    ca: Color;
    cb: Color;
}

function interpolateStopOverride(args: StopInterpArgs): PaintOverride {
    const { vertexIndex, t, a, b, ca, cb } = args;
    const stopRange = b.position - a.position;
    const local = stopRange === 0 ? 0 : (t - a.position) / stopRange;
    return {
        vertexIndex,
        rgb: [ca.r + (cb.r - ca.r) * local, ca.g + (cb.g - ca.g) * local, ca.b + (cb.b - ca.b) * local],
    };
}

export function buildOverride(
    vertexIndex: number,
    t: number,
    sortedStops: ReadonlyArray<GradientStop>,
    stopColors: ReadonlyArray<Color>,
): PaintOverride {
    const lastIdx = sortedStops.length - 1;
    if (t <= sortedStops[0].position) return colorOverride(vertexIndex, stopColors[0]);
    if (t >= sortedStops[lastIdx].position) return colorOverride(vertexIndex, stopColors[lastIdx]);
    for (let i = 0; i < lastIdx; i++) {
        const a = sortedStops[i];
        const b = sortedStops[i + 1];
        if (t >= a.position && t <= b.position)
            return interpolateStopOverride({
                vertexIndex,
                t,
                a,
                b,
                ca: stopColors[i],
                cb: stopColors[i + 1],
            });
    }
    return colorOverride(vertexIndex, stopColors[lastIdx]);
}
