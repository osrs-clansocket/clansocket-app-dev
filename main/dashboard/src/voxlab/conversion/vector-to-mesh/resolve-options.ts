import { DEFAULT_BACK_FACE, DEFAULT_NORMALIZE, DEFAULT_VERTEX_COLOR } from "./constants/defaults.js";
import type { VectorOpts } from "./types.js";
import type { ResolvedOptions } from "./resolve-options-types.js";
import { RESOLVE_BOUNDS } from "./resolve-options-bounds.js";
import { clamp, clampInt } from "./resolve-options-clamp.js";

export type { ResolvedOptions } from "./resolve-options-types.js";

export function resolveOptions(options: VectorOpts): ResolvedOptions {
    return {
        bezierTolerance: clamp(options.bezierTolerance, RESOLVE_BOUNDS.tolerance),
        extrusionDepth: clamp(options.extrusionDepth, RESOLVE_BOUNDS.depth),
        smoothingPasses: clampInt(options.smoothingPasses, RESOLVE_BOUNDS.smooth),
        taubinRounds: clampInt(options.taubinRounds, RESOLVE_BOUNDS.taubin),
        taubinLambda: clamp(options.taubinLambda, RESOLVE_BOUNDS.lambda),
        taubinMu: clamp(options.taubinMu, RESOLVE_BOUNDS.mu),
        cornerAngleDegrees: clamp(options.cornerAngleDegrees, RESOLVE_BOUNDS.corner),
        vertexColor: options.vertexColor ?? DEFAULT_VERTEX_COLOR,
        backFace: options.backFace ?? DEFAULT_BACK_FACE,
        normalize: options.normalize ?? DEFAULT_NORMALIZE,
    };
}
