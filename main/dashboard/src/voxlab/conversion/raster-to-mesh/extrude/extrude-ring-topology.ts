export interface RingTopology {
    start: number;
    end: number;
}

export function determineRingSign(positions: Float32Array, ring: RingTopology): number {
    let area = 0;
    const ringSize = ring.end - ring.start;
    for (let i = 0; i < ringSize; i++) {
        const aIdx = ring.start + i;
        const bIdx = ring.start + ((i + 1) % ringSize);
        const ax = positions[aIdx * 2];
        const ay = positions[aIdx * 2 + 1];
        const bx = positions[bIdx * 2];
        const by = positions[bIdx * 2 + 1];
        area += ax * by - bx * ay;
    }
    return area >= 0 ? 1 : -1;
}
