export interface MeshBounds {
    min: readonly [number, number, number];
    max: readonly [number, number, number];
}

export interface MeshGroupBoundaries {
    frontIndexEnd: number;
    backIndexEnd: number;
    sideIndexEnd: number;
}

export interface MeshMetadata {
    vertexCount: number;
    triangleCount: number;
    bounds: MeshBounds;
    voxelResolution: number;
    extrusionDepth: number;
    groupBoundaries?: MeshGroupBoundaries;
}
