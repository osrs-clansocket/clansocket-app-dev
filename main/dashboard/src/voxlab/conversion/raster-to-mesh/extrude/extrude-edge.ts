function normalizeEdge(dx: number, dy: number): { x: number; y: number } {
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return { x: dx, y: dy };
    return { x: dx / len, y: dy / len };
}

interface OutwardArgs {
    positions: Float32Array;
    vIdx: number;
    prevIdx: number;
    nextIdx: number;
    sign: number;
}

export function outwardAtVertex(a: OutwardArgs): { x: number; y: number } {
    const { positions, vIdx, prevIdx, nextIdx, sign } = a;
    const vx = positions[vIdx * 2],
        vy = positions[vIdx * 2 + 1];
    const px = positions[prevIdx * 2],
        py = positions[prevIdx * 2 + 1];
    const qx = positions[nextIdx * 2],
        qy = positions[nextIdx * 2 + 1];
    const inN = normalizeEdge(vx - px, vy - py);
    const outN = normalizeEdge(qx - vx, qy - vy);
    const t = normalizeEdge(inN.x + outN.x, inN.y + outN.y);
    return { x: sign * t.y, y: -sign * t.x };
}
