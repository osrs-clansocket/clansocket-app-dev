const THOUSAND = 1000;
const TEN_THOUSAND = 10_000;
const MILLION = 1_000_000;
const BILLION = 1_000_000_000;
const SUB_TEN_K_PRECISION = 2;
const SUB_MILLION_PRECISION = 1;

export function formatNumber(n: number): string {
    if (typeof n !== "number") return String(n);
    if (n < THOUSAND) return String(n);
    if (n < MILLION)
        return (n / THOUSAND).toFixed(n < TEN_THOUSAND ? SUB_TEN_K_PRECISION : SUB_MILLION_PRECISION) + "K";
    if (n < BILLION) return (n / MILLION).toFixed(SUB_TEN_K_PRECISION) + "M";
    return (n / BILLION).toFixed(SUB_TEN_K_PRECISION) + "B";
}
