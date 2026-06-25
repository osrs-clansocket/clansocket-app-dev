import { normalizeHex } from "./math.js";

const HUE_MAX = 360;
const PCT_MAX = 100;
const BYTE_MAX = 255;
const HEX_FALLBACK = "#000000";
const HSL_BUCKET = 30;
const HSL_OFFSET = 12;
const RADIX_HEX = 16;
const PAD_HEX = 2;
const K_3 = 3;
const K_4 = 4;
const K_6 = 6;
const K_8 = 8;
const K_9 = 9;
const HEX_SLICE_R0 = 1;
const HEX_SLICE_R1 = 3;
const HEX_SLICE_G1 = 5;
const HEX_SLICE_B1 = 7;
const HSL_MID_LIT = 0.5;

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
    const normalized = normalizeHex(hex) ?? HEX_FALLBACK;
    const r = Number.parseInt(normalized.slice(HEX_SLICE_R0, HEX_SLICE_R1), RADIX_HEX) / BYTE_MAX;
    const g = Number.parseInt(normalized.slice(HEX_SLICE_R1, HEX_SLICE_G1), RADIX_HEX) / BYTE_MAX;
    const b = Number.parseInt(normalized.slice(HEX_SLICE_G1, HEX_SLICE_B1), RADIX_HEX) / BYTE_MAX;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lit = (max + min) / 2;
    let h = 0,
        s = 0;
    if (max !== min) {
        const d = max - min;
        s = lit > HSL_MID_LIT ? d / (2 - max - min) : d / (max + min);
        if (max === r) h = (g - b) / d + (g < b ? K_6 : 0);
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + K_4;
        h *= HUE_MAX / K_6;
    }
    return { h, s: s * PCT_MAX, l: lit * PCT_MAX };
}

export function hslToHex(h: number, s: number, l: number): string {
    const sat = s / PCT_MAX;
    const lit = l / PCT_MAX;
    const k = (n: number): number => (n + h / HSL_BUCKET) % HSL_OFFSET;
    const a = sat * Math.min(lit, 1 - lit);
    const f = (n: number): number => lit - a * Math.max(-1, Math.min(k(n) - K_3, Math.min(K_9 - k(n), 1)));
    const toHex = (x: number): string => {
        const v = Math.round(x * BYTE_MAX);
        return v.toString(RADIX_HEX).padStart(PAD_HEX, "0");
    };
    return `#${toHex(f(0))}${toHex(f(K_8))}${toHex(f(K_4))}`;
}
