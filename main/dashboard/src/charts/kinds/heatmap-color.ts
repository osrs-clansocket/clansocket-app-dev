const ALPHA_MAX = 255;
const HEX_BASE = 16;
const HEX_PAD = 2;
const MIN_ALPHA = 0.08;
const MAX_ALPHA = 1;

export function interpolateColor(color: string, alpha: number): string {
    const clamped = Math.max(MIN_ALPHA, Math.min(MAX_ALPHA, alpha));
    return `${color}${Math.round(clamped * ALPHA_MAX)
        .toString(HEX_BASE)
        .padStart(HEX_PAD, "0")}`;
}
