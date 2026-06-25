import type { PackageLogger } from "../raster-to-mesh/logger.js";
import type { ImageDataLike } from "../raster-to-mesh/types/types-raster.js";
import type { MeshBounds, MeshData, MeshMetadata } from "../raster-to-mesh/types/types-mesh.js";
import type { Point2D, Polygon } from "../raster-to-mesh/types/types-geom.js";

export type VectorSource = { kind: "svg-text"; svgText: string } | { kind: "svg-path"; pathData: string };

export interface VectorOpts {
    source: VectorSource;
    bezierTolerance?: number;
    extrusionDepth?: number;
    smoothingPasses?: number;
    taubinRounds?: number;
    taubinLambda?: number;
    taubinMu?: number;
    cornerAngleDegrees?: number;
    vertexColor?: readonly [number, number, number];
    backFace?: boolean;
    normalize?: boolean;
    logger?: PackageLogger;
}

export type { ImageDataLike, MeshBounds, MeshData, MeshMetadata, Point2D, Polygon };
