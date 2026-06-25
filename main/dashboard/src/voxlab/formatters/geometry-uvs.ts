const STRIDE_3D = 3;

export function generateUvs(positions: Float32Array): Float32Array {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < positions.length; i += STRIDE_3D) {
        const x = positions[i];
        const y = positions[i + 1];
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }
    const w = Math.max(1e-6, maxX - minX);
    const h = Math.max(1e-6, maxY - minY);
    const vertexCount = positions.length / STRIDE_3D;
    const uvs = new Float32Array(vertexCount * 2);
    for (let i = 0, j = 0; i < positions.length; i += STRIDE_3D, j += 2) {
        uvs[j] = (positions[i] - minX) / w;
        uvs[j + 1] = (positions[i + 1] - minY) / h;
    }
    return uvs;
}
