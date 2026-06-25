const INTERP_EPSILON = 1e-9;
const INTERP_MIDPOINT = 0.5;

export interface MarchCorners {
    tl: number;
    tr: number;
    br: number;
    bl: number;
}

interface EdgePointInput {
    x: number;
    y: number;
    corners: MarchCorners;
    threshold: number;
}

function interp(a: number, b: number, t: number): number {
    const diff = b - a;
    if (Math.abs(diff) < INTERP_EPSILON) {
        return INTERP_MIDPOINT;
    }
    const value = (t - a) / diff;
    return Math.max(0, Math.min(1, value));
}

export function edgePoints(input: EdgePointInput): { x: number; y: number }[] {
    const { x, y, corners: c, threshold: t } = input;
    const top = interp(c.tl, c.tr, t);
    const right = interp(c.tr, c.br, t);
    const bottom = interp(c.bl, c.br, t);
    const left = interp(c.tl, c.bl, t);
    return [
        { x: x + top, y },
        { x: x + 1, y: y + right },
        { x: x + bottom, y: y + 1 },
        { x, y: y + left },
    ];
}
