const THOUSAND = 1000;
const TEN_THOUSAND = 10_000;
const MILLION = 1_000_000;
const BILLION = 1_000_000_000;
const SUB_TEN_K_PRECISION = 2;
const SUB_MILLION_PRECISION = 1;

interface FormatTier {
    threshold: number;
    div: number;
    suffix: string;
    precision: (n: number) => number;
}

const FIXED_PRECISION = (): number => SUB_TEN_K_PRECISION;

const tier = (threshold: number, div: number, suffix: string, precision: (n: number) => number): FormatTier => ({
    threshold,
    div,
    suffix,
    precision,
});

const TIERS: ReadonlyArray<FormatTier> = [
    tier(BILLION, BILLION, "B", FIXED_PRECISION),
    tier(MILLION, MILLION, "M", FIXED_PRECISION),
    tier(THOUSAND, THOUSAND, "K", (n) => (n < TEN_THOUSAND ? SUB_TEN_K_PRECISION : SUB_MILLION_PRECISION)),
];

export function formatNumber(n: number): string {
    if (typeof n !== "number") return String(n);
    for (const t of TIERS) {
        if (n >= t.threshold) return (n / t.div).toFixed(t.precision(n)) + t.suffix;
    }
    return String(n);
}
