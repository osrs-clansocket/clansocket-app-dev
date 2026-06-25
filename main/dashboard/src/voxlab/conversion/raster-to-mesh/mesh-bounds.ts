function meshBounds2D(positions2D: Float32Array): { minX: number; minY: number; maxX: number; maxY: number } {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < positions2D.length; i += 2) {
        const x = positions2D[i];
        const y = positions2D[i + 1];
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
    }
    return { minX, minY, maxX, maxY };
}

export function meshScale2D(positions2D: Float32Array): number {
    if (positions2D.length === 0) return 1;
    const { minX, minY, maxX, maxY } = meshBounds2D(positions2D);
    return Math.max(maxX - minX, maxY - minY, 1);
}
