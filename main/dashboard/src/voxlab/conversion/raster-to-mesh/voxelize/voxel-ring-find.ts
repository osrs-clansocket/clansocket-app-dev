interface RingFindArgs {
    mask: Uint8Array;
    width: number;
    cellX: number;
    cellY: number;
    r: number;
    lastX: number;
    lastY: number;
}

export function findInRing(args: RingFindArgs): number {
    const { mask, width, cellX, cellY, r, lastX, lastY } = args;
    for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
            const nx = Math.max(0, Math.min(lastX, cellX + dx));
            const ny = Math.max(0, Math.min(lastY, cellY + dy));
            const idx = ny * width + nx;
            if (mask[idx] === 1) return idx;
        }
    }
    return -1;
}
