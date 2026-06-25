import type { InterpName, TrackType } from "../../shared/types/voxlab/timeline-types.js";
import { hexToRgb, rgbToHex } from "./interp-color.js";
import { smoothInterpolate as smoothInterpInner } from "./interp-cubic.js";

export type InterpolatorFn = (a: unknown, b: unknown, t: number) => unknown;

const numberInterp: InterpolatorFn = (a, b, t) => {
    const na = a as number;
    const nb = b as number;
    return na + (nb - na) * t;
};

const stepInterp: InterpolatorFn = (a, b, t) => (t < 1 ? a : b);

const colorInterp: InterpolatorFn = (a, b, t) => {
    const rgbA = hexToRgb(a as string);
    const rgbB = hexToRgb(b as string);
    if (!rgbA || !rgbB) {
        return t < 0.5 ? a : b;
    }
    const r = Math.round(rgbA[0] + (rgbB[0] - rgbA[0]) * t);
    const g = Math.round(rgbA[1] + (rgbB[1] - rgbA[1]) * t);
    const blue = Math.round(rgbA[2] + (rgbB[2] - rgbA[2]) * t);
    return rgbToHex(r, g, blue);
};

const INTERP: Record<InterpName, InterpolatorFn> = {
    number: numberInterp,
    color: colorInterp,
    step: stepInterp,
};

const TYPE_DEFAULT_INTERP: Record<TrackType, InterpName> = {
    number: "number",
    color: "color",
    step: "step",
};

export interface InterpolateArgs {
    type: TrackType;
    interpName: InterpName | undefined;
    a: unknown;
    b: unknown;
    t: number;
}

export function interpolate(args: InterpolateArgs): unknown {
    const name = args.interpName ?? TYPE_DEFAULT_INTERP[args.type];
    const fn = INTERP[name] ?? stepInterp;
    return fn(args.a, args.b, args.t);
}

export interface SmoothInterpolateArgs {
    type: TrackType;
    interpName: InterpName | undefined;
    p0: unknown;
    p1: unknown;
    p2: unknown;
    p3: unknown;
    t: number;
}

export function smoothInterpolate(args: SmoothInterpolateArgs): unknown {
    const name = args.interpName ?? TYPE_DEFAULT_INTERP[args.type];
    return smoothInterpInner({ ...args, interpName: name, colorFallback: INTERP[name] });
}
