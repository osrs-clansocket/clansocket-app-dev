import type { CubicBezier } from "./cubic-types.js";
import { cubicMidpoint } from "./cubic-midpoint.js";

export function splitCubic(b: CubicBezier): [CubicBezier, CubicBezier] {
    const m01 = cubicMidpoint(b.p0, b.p1);
    const m12 = cubicMidpoint(b.p1, b.p2);
    const m23 = cubicMidpoint(b.p2, b.p3);
    const m012 = cubicMidpoint(m01, m12);
    const m123 = cubicMidpoint(m12, m23);
    const m = cubicMidpoint(m012, m123);
    return [
        { p0: b.p0, p1: m01, p2: m012, p3: m },
        { p0: m, p1: m123, p2: m23, p3: b.p3 },
    ];
}
