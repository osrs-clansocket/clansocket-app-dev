import type { Point2D } from "../types/types-geom.js";

const MIN_RING_VERTS = 3;

function laplacianStep(ring: Point2D[], factor: number): Point2D[] {
    const out: Point2D[] = Array.from<Point2D>({ length: ring.length });
    const n = ring.length;
    for (let i = 0; i < n; i++) {
        const prev = ring[(i - 1 + n) % n];
        const curr = ring[i];
        const next = ring[(i + 1) % n];
        const targetX = (prev.x + next.x) * 0.5;
        const targetY = (prev.y + next.y) * 0.5;
        out[i] = {
            x: curr.x + factor * (targetX - curr.x),
            y: curr.y + factor * (targetY - curr.y),
        };
    }
    return out;
}

export function taubinSmooth(ring: Point2D[], rounds: number, lambda = 0.5, mu = -0.53): Point2D[] {
    if (rounds <= 0 || ring.length < MIN_RING_VERTS) return ring;
    let current: Point2D[] = ring.map((p) => ({ x: p.x, y: p.y }));
    for (let r = 0; r < rounds; r++) {
        current = laplacianStep(current, lambda);
        current = laplacianStep(current, mu);
    }
    return current;
}
