const STRIDE_3D = 3;

export function buildConstantNormals(count: number, x: number, y: number, z: number): Float32Array {
    const out = new Float32Array(count * STRIDE_3D);
    for (let i = 0; i < count; i++) {
        out[i * STRIDE_3D] = x;
        out[i * STRIDE_3D + 1] = y;
        out[i * STRIDE_3D + 2] = z;
    }
    return out;
}
