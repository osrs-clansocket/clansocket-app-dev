import { hasHexChars } from "./hex-detect.js";

export { isHexChar, hasHexChars } from "./hex-detect.js";

export const HUE_MAX = 360;
export const PCT_MAX = 100;
export const BYTE_MAX = 255;
const HEX_FALLBACK = "#000000";
const HEX_FULL_LEN = 6;
const HEX_RGBA_LEN = 8;
const HEX_SHORT_LEN = 3;
const RADIX_HEX = 16;
const PAD_HEX = 2;
const K_3 = 3;
const HEX_SLICE_R0 = 1;
const HEX_SLICE_R1 = 3;
const HEX_SLICE_G1 = 5;
const HEX_SLICE_B1 = 7;
const HEX_SLICE_A0 = 7;
const HEX_SLICE_A1 = 9;

export function normalizeHex(text: string): string | null {
    const t = text.trim();
    if (!t.startsWith("#")) {
        if (hasHexChars(t, HEX_RGBA_LEN)) return `#${t.toLowerCase()}`;
        if (hasHexChars(t, HEX_FULL_LEN)) return `#${t.toLowerCase()}`;
        return null;
    }
    if (hasHexChars(t.slice(1), HEX_RGBA_LEN)) return t.toLowerCase();
    if (hasHexChars(t.slice(1), HEX_FULL_LEN)) return t.toLowerCase();
    if (hasHexChars(t.slice(1), HEX_SHORT_LEN)) {
        const r = t.charAt(1);
        const g = t.charAt(2);
        const b = t.charAt(K_3);
        return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }
    return null;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const normalized = normalizeHex(hex) ?? HEX_FALLBACK;
    return {
        r: Number.parseInt(normalized.slice(HEX_SLICE_R0, HEX_SLICE_R1), RADIX_HEX),
        g: Number.parseInt(normalized.slice(HEX_SLICE_R1, HEX_SLICE_G1), RADIX_HEX),
        b: Number.parseInt(normalized.slice(HEX_SLICE_G1, HEX_SLICE_B1), RADIX_HEX),
    };
}

export function hexToAlpha(hex: string): number {
    const normalized = normalizeHex(hex);
    if (normalized === null || normalized.length < HEX_SLICE_A1) return BYTE_MAX;
    return Number.parseInt(normalized.slice(HEX_SLICE_A0, HEX_SLICE_A1), RADIX_HEX);
}

function clampByte(v: number): number {
    return Math.max(0, Math.min(BYTE_MAX, Math.round(v)));
}

function byteHex(v: number): string {
    return clampByte(v).toString(RADIX_HEX).padStart(PAD_HEX, "0");
}

export function rgbToHex(r: number, g: number, b: number): string {
    return `#${byteHex(r)}${byteHex(g)}${byteHex(b)}`;
}

export function withAlpha(rgbHex: string, alpha: number): string {
    if (clampByte(alpha) >= BYTE_MAX) return rgbHex;
    return `${rgbHex}${byteHex(alpha)}`;
}
