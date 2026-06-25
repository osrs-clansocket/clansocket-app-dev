import {
    DEFAULT_ALPHA_THRESHOLD,
    DEFAULT_BACK_FACE,
    DEFAULT_CORNER_ANGLE_DEGREES,
    DEFAULT_EXTRUSION_DEPTH,
    DEFAULT_NORMALIZE,
    DEFAULT_SMOOTHING_PASSES,
    DEFAULT_TAUBIN_LAMBDA,
    DEFAULT_TAUBIN_MU,
    DEFAULT_TAUBIN_ROUNDS,
    DEFAULT_VERTEX_COLOR,
    DEFAULT_VOXEL_RESOLUTION,
    MAX_CORNER_ANGLE_DEGREES,
    MAX_EXTRUSION_DEPTH,
    MAX_SMOOTHING_PASSES,
    MAX_TAUBIN_LAMBDA,
    MAX_TAUBIN_MU,
    MAX_TAUBIN_ROUNDS,
    MAX_VOXEL_RESOLUTION,
    MIN_CORNER_ANGLE_DEGREES,
    MIN_EXTRUSION_DEPTH,
    MIN_SMOOTHING_PASSES,
    MIN_TAUBIN_LAMBDA,
    MIN_TAUBIN_MU,
    MIN_TAUBIN_ROUNDS,
    MIN_VOXEL_RESOLUTION,
} from "./constants/defaults.js";
import type { RasterOpts } from "./types/types-raster.js";

export { validateInput } from "./raster-mesh-validate.js";

export interface Resolved {
    voxelResolution: number;
    extrusionDepth: number;
    smoothingPasses: number;
    taubinRounds: number;
    taubinLambda: number;
    taubinMu: number;
    cornerAngleDegrees: number;
    alphaThreshold: number;
    vertexColor: readonly [number, number, number];
    backFace: boolean;
    normalize: boolean;
}

interface NumericBounds {
    fallback: number;
    min: number;
    max: number;
}

const RESOLVE_BOUNDS: Record<string, NumericBounds> = {
    voxel: { fallback: DEFAULT_VOXEL_RESOLUTION, min: MIN_VOXEL_RESOLUTION, max: MAX_VOXEL_RESOLUTION },
    depth: { fallback: DEFAULT_EXTRUSION_DEPTH, min: MIN_EXTRUSION_DEPTH, max: MAX_EXTRUSION_DEPTH },
    smooth: { fallback: DEFAULT_SMOOTHING_PASSES, min: MIN_SMOOTHING_PASSES, max: MAX_SMOOTHING_PASSES },
    taubin: { fallback: DEFAULT_TAUBIN_ROUNDS, min: MIN_TAUBIN_ROUNDS, max: MAX_TAUBIN_ROUNDS },
    lambda: { fallback: DEFAULT_TAUBIN_LAMBDA, min: MIN_TAUBIN_LAMBDA, max: MAX_TAUBIN_LAMBDA },
    mu: { fallback: DEFAULT_TAUBIN_MU, min: MIN_TAUBIN_MU, max: MAX_TAUBIN_MU },
    corner: { fallback: DEFAULT_CORNER_ANGLE_DEGREES, min: MIN_CORNER_ANGLE_DEGREES, max: MAX_CORNER_ANGLE_DEGREES },
    alpha: { fallback: DEFAULT_ALPHA_THRESHOLD, min: 0, max: 1 },
};

function clamp(value: number | undefined, bounds: NumericBounds): number {
    if (value === undefined || !Number.isFinite(value)) return bounds.fallback;
    return Math.max(bounds.min, Math.min(bounds.max, value));
}

function clampInt(value: number | undefined, bounds: NumericBounds): number {
    return Math.floor(clamp(value, bounds));
}

export function resolveOptions(options: RasterOpts): Resolved {
    return {
        voxelResolution: clampInt(options.voxelResolution, RESOLVE_BOUNDS.voxel),
        extrusionDepth: clamp(options.extrusionDepth, RESOLVE_BOUNDS.depth),
        smoothingPasses: clampInt(options.smoothingPasses, RESOLVE_BOUNDS.smooth),
        taubinRounds: clampInt(options.taubinRounds, RESOLVE_BOUNDS.taubin),
        taubinLambda: clamp(options.taubinLambda, RESOLVE_BOUNDS.lambda),
        taubinMu: clamp(options.taubinMu, RESOLVE_BOUNDS.mu),
        cornerAngleDegrees: clamp(options.cornerAngleDegrees, RESOLVE_BOUNDS.corner),
        alphaThreshold: clamp(options.alphaThreshold, RESOLVE_BOUNDS.alpha),
        vertexColor: options.vertexColor ?? DEFAULT_VERTEX_COLOR,
        backFace: options.backFace ?? DEFAULT_BACK_FACE,
        normalize: options.normalize ?? DEFAULT_NORMALIZE,
    };
}
