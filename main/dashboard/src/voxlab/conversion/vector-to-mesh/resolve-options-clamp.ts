import type { NumericBounds } from "./resolve-options-types.js";

export function clamp(value: number | undefined, bounds: NumericBounds): number {
    if (value === undefined || !Number.isFinite(value)) return bounds.fallback;
    return Math.max(bounds.min, Math.min(bounds.max, value));
}

export function clampInt(value: number | undefined, bounds: NumericBounds): number {
    return Math.floor(clamp(value, bounds));
}
