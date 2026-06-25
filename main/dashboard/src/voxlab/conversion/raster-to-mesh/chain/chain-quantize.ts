const QUANTIZE_PRECISION = 1e4;
const Y_SHIFT = 1 << 24;

export function chainQuantize(x: number, y: number): number {
    const qx = Math.round(x * QUANTIZE_PRECISION) | 0;
    const qy = Math.round(y * QUANTIZE_PRECISION) | 0;
    return qy * Y_SHIFT + qx;
}
