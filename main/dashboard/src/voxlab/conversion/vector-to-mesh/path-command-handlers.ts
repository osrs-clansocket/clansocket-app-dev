import { flattenCubic, type CubicBezier } from "./flatten/flatten-cubic.js";
import { flattenQuadratic, type QuadraticBezier } from "./flatten/flatten-quadratic.js";
import { finalizeCurrent } from "./path-finalize.js";
import type { ParseState } from "./path-parse-state.js";

export function handleMoveTo(state: ParseState, x: number, y: number): void {
    finalizeCurrent(state);
    state.current = [{ x, y }];
    state.startPoint = { x, y };
    state.pen = { x, y };
}

export function handleLineTo(state: ParseState, x: number, y: number): void {
    state.current.push({ x, y });
    state.pen = { x, y };
}

export interface CubicArgs {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    x: number;
    y: number;
}

export function handleCubic(state: ParseState, c: CubicArgs): void {
    const bez: CubicBezier = {
        p0: { ...state.pen },
        p1: { x: c.x1, y: c.y1 },
        p2: { x: c.x2, y: c.y2 },
        p3: { x: c.x, y: c.y },
    };
    flattenCubic(bez, state.tolerance, state.current);
    state.pen = { x: c.x, y: c.y };
}

export interface QuadraticArgs {
    x1: number;
    y1: number;
    x: number;
    y: number;
}

export function handleQuadratic(state: ParseState, q: QuadraticArgs): void {
    const bez: QuadraticBezier = {
        p0: { ...state.pen },
        p1: { x: q.x1, y: q.y1 },
        p2: { x: q.x, y: q.y },
    };
    flattenQuadratic(bez, state.tolerance, state.current);
    state.pen = { x: q.x, y: q.y };
}

export function handleClosePath(state: ParseState): void {
    if (state.startPoint === null) return;
    state.pen = { x: state.startPoint.x, y: state.startPoint.y };
}
