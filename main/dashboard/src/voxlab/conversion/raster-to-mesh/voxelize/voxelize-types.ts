export interface VoxelGrid {
    mask: Uint8Array;
    alpha: Float32Array;
    rgb: Float32Array;
    resolution: number;
    aspectRatio: number;
    width: number;
    height: number;
    cellSize: number;
    border: number;
}

export interface VoxelDims {
    cellSize: number;
    coreW: number;
    coreH: number;
    outW: number;
    outH: number;
}
