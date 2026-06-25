const DECIMAL_RADIX = 10;

export function parseDecimal(s: string): number {
    return Number.parseInt(s, DECIMAL_RADIX);
}
