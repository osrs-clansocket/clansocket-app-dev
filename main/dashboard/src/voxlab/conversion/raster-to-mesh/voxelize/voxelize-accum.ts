const RGB_STRIDE = 3;
const OPAQUE_THRESHOLD = 0.95;

export interface CellAccum {
    sumAlpha: number;
    totalCount: number;
    sumOpaqueR: number;
    sumOpaqueG: number;
    sumOpaqueB: number;
    opaqueCount: number;
    sumAllR: number;
    sumAllG: number;
    sumAllB: number;
}

export function emptyAccum(): CellAccum {
    return {
        sumAlpha: 0,
        totalCount: 0,
        sumOpaqueR: 0,
        sumOpaqueG: 0,
        sumOpaqueB: 0,
        opaqueCount: 0,
        sumAllR: 0,
        sumAllG: 0,
        sumAllB: 0,
    };
}

export function addAccumPixel(a: CellAccum, srcAlpha: Float32Array, srcRgb: Float32Array, idx: number): void {
    const al = srcAlpha[idx];
    a.sumAlpha += al;
    a.totalCount++;
    const rgbIdx = idx * RGB_STRIDE;
    const r = srcRgb[rgbIdx];
    const g = srcRgb[rgbIdx + 1];
    const b = srcRgb[rgbIdx + 2];
    a.sumAllR += r;
    a.sumAllG += g;
    a.sumAllB += b;
    if (al >= OPAQUE_THRESHOLD) {
        a.sumOpaqueR += r;
        a.sumOpaqueG += g;
        a.sumOpaqueB += b;
        a.opaqueCount++;
    }
}

export { RGB_STRIDE };
