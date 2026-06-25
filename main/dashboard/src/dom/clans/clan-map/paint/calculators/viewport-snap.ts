export function snapBounds(
    b: { minX: number; maxX: number; minY: number; maxY: number },
    regionPx: number,
): { minX: number; maxX: number; minY: number; maxY: number } {
    return {
        minX: Math.floor(b.minX / regionPx) * regionPx,
        maxX: Math.ceil((b.maxX + 1) / regionPx) * regionPx,
        minY: Math.floor(b.minY / regionPx) * regionPx,
        maxY: Math.ceil((b.maxY + 1) / regionPx) * regionPx,
    };
}
