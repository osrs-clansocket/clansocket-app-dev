import { memoize } from "../../state/caches/memoize.js";

const BILLION = 1_000_000_000;
const MILLION = 1_000_000;
const THOUSAND = 1_000;
const SCALE_LADDER: Array<[number, string, number]> = [
    [BILLION, "B", 2],
    [MILLION, "M", 2],
    [THOUSAND, "K", 1],
];
const PLACEHOLDER = "—";

export const formatNumber = memoize(
    (n: number): string => {
        if (!Number.isFinite(n)) return PLACEHOLDER;
        const abs = Math.abs(n);
        for (const [divisor, suffix, digits] of SCALE_LADDER) {
            if (abs >= divisor) return `${parseFloat((n / divisor).toFixed(digits))}${suffix}`;
        }
        return n.toLocaleString();
    },
    { tag: "render", maxEntries: 1024, keyOf: (n) => String(n) },
);
