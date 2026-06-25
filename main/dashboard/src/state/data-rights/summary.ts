import { tableMeta, type TableSummary } from "./table-meta.js";
import { formatVal } from "./summary-formatters.js";
import { applySummaryFields, fallbackPrimary } from "./summary-orchestration.js";
import type { RowSummary, RowSummaryOpts } from "./summary-types.js";

export type { RowSummary, RowSummaryOpts } from "./summary-types.js";

export function rowSummary({ table, row, pkCols, tsCol, secretColumns }: RowSummaryOpts): RowSummary {
    const meta = tableMeta(table);
    const sum: TableSummary | undefined = meta.summary;
    const secrets = new Set(secretColumns);
    const used = new Set<string>();
    const fields = applySummaryFields(sum, row, used);
    const primary = fallbackPrimary(fields.primary, row, pkCols, secrets);
    const metaTs = fields.updated || (tsCol && !used.has(tsCol) ? formatVal(row[tsCol]) : "");
    return { primary, secondary: fields.secondary, meta: metaTs };
}
