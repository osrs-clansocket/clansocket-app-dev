const NUMBER_EPSILON = 1e-6;
const HEX_COLOR_LONG_LEN = 7;
const HEX_COLOR_SHORT_LEN = 4;

function isHexColor(value: unknown): boolean {
    if (typeof value !== "string") return false;
    if (value.charAt(0) !== "#") return false;
    return value.length === HEX_COLOR_LONG_LEN || value.length === HEX_COLOR_SHORT_LEN;
}

export function checkValueType(type: string, value: unknown): string | null {
    if (type === "number") {
        return typeof value === "number" && Number.isFinite(value)
            ? null
            : `value must be a finite number, got ${typeof value}`;
    }
    if (type === "color") {
        return isHexColor(value) ? null : `value must be a hex color string (#rrggbb), got ${typeof value}`;
    }
    return null;
}

export function valuesMatch(type: string, a: unknown, b: unknown): boolean {
    if (type === "number") {
        return Math.abs((a as number) - (b as number)) <= NUMBER_EPSILON;
    }
    if (type === "color") {
        return typeof a === "string" && typeof b === "string" && a.toLowerCase() === b.toLowerCase();
    }
    return a === b;
}
