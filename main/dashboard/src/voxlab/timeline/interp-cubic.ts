import type { InterpName, TrackType } from "../../shared/types/voxlab/timeline-types.js";
import { clamp255, hexToRgb, rgbToHex } from "./interp-color.js";

const CR_HALF = 0.5;
const CR_T2_NEG = 5;
const CR_T2_POS = 4;
const CR_T3 = 3;

interface CatmullPoints {
    p0: number;
    p1: number;
    p2: number;
    p3: number;
}

function catmullRom(pts: CatmullPoints, t: number): number {
    const { p0, p1, p2, p3 } = pts;
    const t2 = t * t;
    const t3 = t2 * t;
    return (
        CR_HALF *
        (2 * p1 +
            (-p0 + p2) * t +
            (2 * p0 - CR_T2_NEG * p1 + CR_T2_POS * p2 - p3) * t2 +
            (-p0 + CR_T3 * p1 - CR_T3 * p2 + p3) * t3)
    );
}

interface CubicPoints {
    p0: unknown;
    p1: unknown;
    p2: unknown;
    p3: unknown;
}

function smoothColor(pts: CubicPoints, t: number, fallback: () => unknown): unknown {
    const c0 = hexToRgb(pts.p0 as string);
    const c1 = hexToRgb(pts.p1 as string);
    const c2 = hexToRgb(pts.p2 as string);
    const c3 = hexToRgb(pts.p3 as string);
    if (!c0 || !c1 || !c2 || !c3) return fallback();
    const r = clamp255(catmullRom({ p0: c0[0], p1: c1[0], p2: c2[0], p3: c3[0] }, t));
    const g = clamp255(catmullRom({ p0: c0[1], p1: c1[1], p2: c2[1], p3: c3[1] }, t));
    const b = clamp255(catmullRom({ p0: c0[2], p1: c1[2], p2: c2[2], p3: c3[2] }, t));
    return rgbToHex(r, g, b);
}

export interface SmoothInterpolateArgs {
    type: TrackType;
    interpName: InterpName | undefined;
    p0: unknown;
    p1: unknown;
    p2: unknown;
    p3: unknown;
    t: number;
    colorFallback: (a: unknown, b: unknown, t: number) => unknown;
}

export function smoothInterpolate(args: SmoothInterpolateArgs): unknown {
    const { type, interpName, p0, p1, p2, p3, t, colorFallback } = args;
    if (interpName === "step" || type === "step") return t < 1 ? p1 : p2;
    if (type === "color") return smoothColor({ p0, p1, p2, p3 }, t, () => colorFallback(p1, p2, t));
    return catmullRom({ p0: p0 as number, p1: p1 as number, p2: p2 as number, p3: p3 as number }, t);
}
