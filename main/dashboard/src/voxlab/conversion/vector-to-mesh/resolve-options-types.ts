export interface ResolvedOptions {
    bezierTolerance: number;
    extrusionDepth: number;
    smoothingPasses: number;
    taubinRounds: number;
    taubinLambda: number;
    taubinMu: number;
    cornerAngleDegrees: number;
    vertexColor: readonly [number, number, number];
    backFace: boolean;
    normalize: boolean;
}

export interface NumericBounds {
    fallback: number;
    min: number;
    max: number;
}
