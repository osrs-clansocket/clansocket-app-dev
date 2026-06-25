import type { Point2D } from "../types/types-geom.js";

const MIN_FLATTEN_VERTS = 4;
const DEGREES_HALF_CIRCLE = 180;

function findCorners(ring: Point2D[], cosThreshold: number): number[] {
    const n = ring.length;
    const corners: number[] = [];
    for (let i = 0; i < n; i++) {
        const prev = ring[(i - 1 + n) % n];
        const curr = ring[i];
        const next = ring[(i + 1) % n];
        const inX = curr.x - prev.x;
        const inY = curr.y - prev.y;
        const outX = next.x - curr.x;
        const outY = next.y - curr.y;
        const inLen = Math.sqrt(inX * inX + inY * inY);
        const outLen = Math.sqrt(outX * outX + outY * outY);
        if (inLen <= 0 || outLen <= 0) continue;
        const cosAngle = (inX * outX + inY * outY) / (inLen * outLen);
        if (cosAngle < cosThreshold) corners.push(i);
    }
    return corners;
}

interface FlattenPairArgs {
    out: Point2D[];
    ring: Point2D[];
    c1Idx: number;
    c2Idx: number;
    n: number;
}

function flattenBetweenPair(args: FlattenPairArgs): void {
    const { out, ring, c1Idx, c2Idx, n } = args;
    const c1 = ring[c1Idx];
    const c2 = ring[c2Idx];
    const dx = c2.x - c1.x;
    const dy = c2.y - c1.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq <= 0) return;
    let i = (c1Idx + 1) % n;
    let safety = 0;
    while (i !== c2Idx && safety <= n + 1) {
        const p = ring[i];
        const t = ((p.x - c1.x) * dx + (p.y - c1.y) * dy) / lenSq;
        out[i].x = c1.x + t * dx;
        out[i].y = c1.y + t * dy;
        i = (i + 1) % n;
        safety++;
    }
}

export function flattenBetweenCorners(ring: Point2D[], thresholdDegrees: number): Point2D[] {
    if (thresholdDegrees <= 0 || thresholdDegrees >= DEGREES_HALF_CIRCLE || ring.length < MIN_FLATTEN_VERTS)
        return ring;
    const n = ring.length;
    const cosThreshold = Math.cos((thresholdDegrees * Math.PI) / DEGREES_HALF_CIRCLE);
    const corners = findCorners(ring, cosThreshold);
    if (corners.length < 2) return ring;
    const out: Point2D[] = ring.map((p) => ({ x: p.x, y: p.y }));
    for (let k = 0; k < corners.length; k++) {
        flattenBetweenPair({ out, ring, n, c1Idx: corners[k], c2Idx: corners[(k + 1) % corners.length] });
    }
    return out;
}
