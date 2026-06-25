import type { TableSummary } from "./table-meta.js";
import { field, formatVal } from "./summary-formatters.js";
import { summaryPrimary } from "./summary-primary.js";

export function applySummaryFields(
    sum: TableSummary | undefined,
    row: Record<string, unknown>,
    used: Set<string>,
): { primary: string; secondary: string; updated: string } {
    if (!sum) return { primary: "", secondary: "", updated: "" };
    for (const c of [sum.primary, sum.secondary, sum.updated]) if (c) used.add(c);
    return {
        primary: field(row, sum.primary),
        secondary: field(row, sum.secondary),
        updated: field(row, sum.updated),
    };
}

export function fallbackPrimary(
    primary: string,
    row: Record<string, unknown>,
    pkCols: readonly string[],
    secrets: Set<string>,
): string {
    if (primary) return primary;
    const heuristic = summaryPrimary(row, secrets);
    if (heuristic) return heuristic;
    if (pkCols.length > 0) return pkCols.map((c) => formatVal(row[c])).join(" · ");
    return "row";
}
