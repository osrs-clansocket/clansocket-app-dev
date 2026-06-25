export function writeRgb(out: Float32Array, outBase: number, rgb: ArrayLike<number>, srcBase: number): void {
    out[outBase] = rgb[srcBase];
    out[outBase + 1] = rgb[srcBase + 1];
    out[outBase + 2] = rgb[srcBase + 2];
}
