const COLOR_CHANNEL_MAX = 255;
const HEX_RGB_LEN = 6;

export function clamp255(n: number): number {
    return Math.round(Math.max(0, Math.min(COLOR_CHANNEL_MAX, n)));
}

export function hexToRgb(hex: string): [number, number, number] | null {
    if (typeof hex !== "string" || hex.length === 0) {
        return null;
    }
    const trimmed = hex.charAt(0) === "#" ? hex.slice(1) : hex;
    if (trimmed.length !== HEX_RGB_LEN) {
        return null;
    }
    const r = Number.parseInt(trimmed.slice(0, 2), 16);
    const g = Number.parseInt(trimmed.slice(2, 4), 16);
    const b = Number.parseInt(trimmed.slice(4, 6), 16);
    if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
        return null;
    }
    return [r, g, b];
}

export function rgbToHex(r: number, g: number, b: number): string {
    const clamp = (n: number): number => Math.max(0, Math.min(COLOR_CHANNEL_MAX, n));
    const hex = (n: number): string => clamp(n).toString(16).padStart(2, "0");
    return `#${hex(r)}${hex(g)}${hex(b)}`;
}
