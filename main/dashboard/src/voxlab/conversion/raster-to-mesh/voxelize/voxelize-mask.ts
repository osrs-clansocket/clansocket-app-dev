export function maskFromAlpha(alpha: Float32Array, threshold: number): Uint8Array {
    const mask = new Uint8Array(alpha.length);
    for (let i = 0; i < alpha.length; i++) mask[i] = alpha[i] >= threshold ? 1 : 0;
    return mask;
}
