import type { ImageDataLike } from "./raster-to-mesh/types/types-raster.js";

export type VoxlabSource =
    | { kind: "raster"; imageData: ImageDataLike }
    | { kind: "svg-text"; svgText: string }
    | { kind: "vector-glyph"; provider: string; name: string };
