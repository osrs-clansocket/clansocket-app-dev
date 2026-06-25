export interface SourceGrid {
    srcAlpha: Float32Array;
    srcRgb: Float32Array;
    srcW: number;
    srcH: number;
    cellSize: number;
}

export interface CellAverage {
    alpha: number;
    r: number;
    g: number;
    b: number;
}
