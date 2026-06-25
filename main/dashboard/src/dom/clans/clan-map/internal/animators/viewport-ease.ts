const EASE_OUT_POWER = 3;

export function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, EASE_OUT_POWER);
}
