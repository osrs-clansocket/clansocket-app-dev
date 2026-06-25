import { HEURISTIC_FIELDS } from "./summary-constants.js";
import { formatVal, truncate } from "./summary-formatters.js";
import { isPrimarySummary } from "./summary-predicates.js";

export function summaryPrimary(row: Record<string, unknown>, secrets: ReadonlySet<string>): string {
    for (const f of HEURISTIC_FIELDS) {
        if (secrets.has(f)) continue;
        const v = formatVal(row[f]);
        if (v.length > 0) return truncate(v);
    }
    for (const [k, v] of Object.entries(row)) {
        if (secrets.has(k)) continue;
        const s = formatVal(v);
        if (isPrimarySummary(s)) return truncate(s);
    }
    return "";
}
