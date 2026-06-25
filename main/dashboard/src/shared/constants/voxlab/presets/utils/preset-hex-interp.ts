const HEX_BASE = 16;
const HEX_CHANNEL_R_START = 0;
const HEX_CHANNEL_R_END = 2;
const HEX_CHANNEL_G_END = 4;
const HEX_CHANNEL_B_END = 6;

function parseHex(hex: string): [number, number, number] {
    const t = hex.startsWith("#") ? hex.slice(1) : hex;
    return [
        Number.parseInt(t.slice(HEX_CHANNEL_R_START, HEX_CHANNEL_R_END), HEX_BASE),
        Number.parseInt(t.slice(HEX_CHANNEL_R_END, HEX_CHANNEL_G_END), HEX_BASE),
        Number.parseInt(t.slice(HEX_CHANNEL_G_END, HEX_CHANNEL_B_END), HEX_BASE),
    ];
}

export function lerpHex(a: string, b: string, u: number): string {
    const pa = parseHex(a);
    const pb = parseHex(b);
    const ch = (i: number): string =>
        Math.round(pa[i] + (pb[i] - pa[i]) * u)
            .toString(HEX_BASE)
            .padStart(2, "0");
    return `#${ch(0)}${ch(1)}${ch(2)}`;
}
