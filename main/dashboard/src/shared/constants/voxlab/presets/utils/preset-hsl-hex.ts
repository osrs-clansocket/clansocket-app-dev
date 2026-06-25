const HSL_PERCENT_SCALE = 100;
const HSL_HUE_DIVISOR = 30;
const HSL_HUE_MODULUS = 12;
const HSL_F_OFFSET_3 = 3;
const HSL_F_OFFSET_9 = 9;
const HSL_RGB_R_OFFSET = 0;
const HSL_RGB_G_OFFSET = 8;
const HSL_RGB_B_OFFSET = 4;
const BYTE_MAX = 255;
const HEX_BASE = 16;

export function hslHex(h: number, s: number, l: number): string {
    const sat = s / HSL_PERCENT_SCALE;
    const lit = l / HSL_PERCENT_SCALE;
    const k = (n: number): number => (n + h / HSL_HUE_DIVISOR) % HSL_HUE_MODULUS;
    const a = sat * Math.min(lit, 1 - lit);
    const f = (n: number): number =>
        lit - a * Math.max(-1, Math.min(k(n) - HSL_F_OFFSET_3, Math.min(HSL_F_OFFSET_9 - k(n), 1)));
    const toHex = (x: number): string =>
        Math.round(x * BYTE_MAX)
            .toString(HEX_BASE)
            .padStart(2, "0");
    return `#${toHex(f(HSL_RGB_R_OFFSET))}${toHex(f(HSL_RGB_G_OFFSET))}${toHex(f(HSL_RGB_B_OFFSET))}`;
}
