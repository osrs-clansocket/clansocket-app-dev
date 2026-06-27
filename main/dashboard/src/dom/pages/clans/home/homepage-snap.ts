import type { HomepageComponent } from "../../../../state/clans/homepage/types.js";
import type { Guide, GuideAxis } from "./homepage-guides-state.js";

export const SNAP_THRESHOLD = 8;

type Dir = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export interface Box {
    x: number;
    y: number;
    w: number;
    h: number;
}

interface AxisSnap {
    delta: number;
    dist: number;
}

function bestAxisSnap(candidates: ReadonlyArray<number>, guides: ReadonlyArray<Guide>, axis: "x" | "y"): AxisSnap {
    let bestDelta = 0;
    let bestDist = SNAP_THRESHOLD + 1;
    for (const g of guides) {
        if (g.axis !== axis) continue;
        for (const cand of candidates) {
            const dist = Math.abs(cand - g.position);
            if (dist < bestDist) {
                bestDist = dist;
                bestDelta = g.position - cand;
            }
        }
    }
    return { delta: bestDelta, dist: bestDist };
}

export function snapPosition(box: Box, guides: ReadonlyArray<Guide>): Box {
    if (guides.length === 0) return box;
    const xCands = [box.x, box.x + box.w / 2, box.x + box.w];
    const yCands = [box.y, box.y + box.h / 2, box.y + box.h];
    const snapX = bestAxisSnap(xCands, guides, "x");
    const snapY = bestAxisSnap(yCands, guides, "y");
    return {
        x: snapX.dist <= SNAP_THRESHOLD ? box.x + snapX.delta : box.x,
        y: snapY.dist <= SNAP_THRESHOLD ? box.y + snapY.delta : box.y,
        w: box.w,
        h: box.h,
    };
}

function snapEdge(value: number, guides: ReadonlyArray<Guide>, axis: "x" | "y"): number {
    const snap = bestAxisSnap([value], guides, axis);
    return snap.dist <= SNAP_THRESHOLD ? value + snap.delta : value;
}

export function snapResize(dir: Dir, box: Box, guides: ReadonlyArray<Guide>): Box {
    if (guides.length === 0) return box;
    let { x, y, w, h } = box;
    if (dir.includes("w")) {
        const right = x + w;
        const newX = snapEdge(x, guides, "x");
        x = newX;
        w = right - x;
    }
    if (dir.includes("e")) {
        const right = snapEdge(x + w, guides, "x");
        w = right - x;
    }
    if (dir.includes("n")) {
        const bottom = y + h;
        const newY = snapEdge(y, guides, "y");
        y = newY;
        h = bottom - y;
    }
    if (dir.includes("s")) {
        const bottom = snapEdge(y + h, guides, "y");
        h = bottom - y;
    }
    return { x, y, w, h };
}

function componentSnapTargets(c: HomepageComponent, axis: GuideAxis): readonly number[] {
    if (axis === "x") return [c.canvasX, c.canvasX + c.canvasW / 2, c.canvasX + c.canvasW];
    return [c.canvasY, c.canvasY + c.canvasH / 2, c.canvasY + c.canvasH];
}

export function snapAxis(
    axis: GuideAxis,
    position: number,
    components: ReadonlyArray<HomepageComponent>,
): number {
    let bestPos = position;
    let bestDist = SNAP_THRESHOLD + 1;
    for (const c of components) {
        for (const target of componentSnapTargets(c, axis)) {
            const dist = Math.abs(position - target);
            if (dist < bestDist) {
                bestDist = dist;
                bestPos = target;
            }
        }
    }
    return bestDist <= SNAP_THRESHOLD ? bestPos : position;
}
