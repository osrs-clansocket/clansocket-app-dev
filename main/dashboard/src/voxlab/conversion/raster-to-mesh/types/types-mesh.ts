import type { MeshAttributes } from "./types-mesh-attributes.js";
import type { MeshMetadata } from "./types-mesh-metadata.js";

export type { MeshBounds, MeshGroupBoundaries, MeshMetadata } from "./types-mesh-metadata.js";
export type { MeshAttributes } from "./types-mesh-attributes.js";

export interface MeshData extends MeshAttributes {
    metadata: MeshMetadata;
}
