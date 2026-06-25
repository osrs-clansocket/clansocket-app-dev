const TRIANGLE_INDEX_STEP = 3;

export function buildBackIndices(frontIndices: Uint32Array, offset: number): Uint32Array {
    const out = new Uint32Array(frontIndices.length);
    for (let i = 0; i < frontIndices.length; i += TRIANGLE_INDEX_STEP) {
        out[i] = frontIndices[i] + offset;
        out[i + 1] = frontIndices[i + 2] + offset;
        out[i + 2] = frontIndices[i + 1] + offset;
    }
    return out;
}
