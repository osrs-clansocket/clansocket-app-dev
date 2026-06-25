const STRIDE_3D = 3;

export function buildPlanePositions(positions2D: Float32Array, z: number): Float32Array {
    const count = positions2D.length / 2;
    const out = new Float32Array(count * STRIDE_3D);
    for (let i = 0; i < count; i++) {
        out[i * STRIDE_3D] = positions2D[i * 2];
        out[i * STRIDE_3D + 1] = positions2D[i * 2 + 1];
        out[i * STRIDE_3D + 2] = z;
    }
    return out;
}
