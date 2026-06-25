import type { PackageLogger } from "../logger.js";

export interface ImageDataLike {
    data: Uint8ClampedArray;
    width: number;
    height: number;
}

export interface RasterOpts {
    imageData: ImageDataLike;
    voxelResolution?: number;
    extrusionDepth?: number;
    smoothingPasses?: number;
    taubinRounds?: number;
    taubinLambda?: number;
    taubinMu?: number;
    cornerAngleDegrees?: number;
    alphaThreshold?: number;
    vertexColor?: readonly [number, number, number];
    backFace?: boolean;
    normalize?: boolean;
    logger?: PackageLogger;
}
