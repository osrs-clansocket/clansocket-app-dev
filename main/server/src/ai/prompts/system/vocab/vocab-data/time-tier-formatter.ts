import { STALENESS_TIERS } from "../../../sources/data/time-config.js";

function formatNum(n: number): string {
    return n.toLocaleString("en-US").split(",").join("_");
}

export function formatStalenessTiers(): string[] {
    const lines: string[] = [];
    let prevBound = 0;
    for (const tier of STALENESS_TIERS) {
        if (tier.maxMs === null) {
            lines.push(`- \`now - ts ≥ ${formatNum(prevBound)}\` → ${tier.label} (${tier.phrasing}).`);
        } else {
            const lower = prevBound === 0 ? "" : `${formatNum(prevBound)} ≤ `;
            lines.push(`- \`${lower}now - ts < ${formatNum(tier.maxMs)}\` → ${tier.label} (${tier.phrasing}).`);
            prevBound = tier.maxMs;
        }
    }
    return lines;
}
