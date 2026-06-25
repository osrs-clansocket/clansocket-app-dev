export interface PolygonFace {
    positions: Float32Array;
    indices: Uint32Array;
    polygonStarts: number[];
    polygonEnds: number[];
}
