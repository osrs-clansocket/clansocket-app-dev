import { isPlainObject } from "../../shared/validators/type-guards.js";

export const ICON_BAKE_SIZE = 256;
export const TRANSPARENT_RGBA = { r: 0, g: 0, b: 0, alpha: 0 } as const;

const ICON_MIN_SCALE = 0.1;
const ICON_MAX_SCALE = 5;
const ICON_MAX_ROTATE_DEGREES = 360;
const ICON_OFFSET_MULTIPLIER = 2;

export interface CustomizeTransform {
    scale: number;
    rotate: number;
    translateX: number;
    translateY: number;
}

function isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
}

function isInBounds(t: CustomizeTransform): boolean {
    if (!isInRange(t.scale, ICON_MIN_SCALE, ICON_MAX_SCALE)) return false;
    if (!isInRange(t.rotate, -ICON_MAX_ROTATE_DEGREES, ICON_MAX_ROTATE_DEGREES)) return false;
    const maxOffset = ICON_BAKE_SIZE * ICON_OFFSET_MULTIPLIER;
    return Math.abs(t.translateX) <= maxOffset && Math.abs(t.translateY) <= maxOffset;
}

export function parseTransform(body: unknown): CustomizeTransform | null {
    if (!isPlainObject(body)) return null;
    const finite = (v: unknown): number | null => (typeof v === "number" ? v : null);
    const scale = finite(body.scale);
    const rotate = finite(body.rotate);
    const translateX = finite(body.translateX);
    const translateY = finite(body.translateY);
    if (scale === null || rotate === null || translateX === null || translateY === null) return null;
    const t: CustomizeTransform = { scale, rotate, translateX, translateY };
    return isInBounds(t) ? t : null;
}
