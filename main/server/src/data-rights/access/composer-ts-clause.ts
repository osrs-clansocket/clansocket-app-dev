import { asFiniteNumber } from "../../shared/coerce.js";
import type { BrowseRequest } from "./browse-shared.js";
import { introspectTable, quoteIdent } from "./db-introspect.js";

export function composeTsClause(
    args: BrowseRequest,
    info: NonNullable<ReturnType<typeof introspectTable>>,
): { sql: string; args: unknown[] } {
    const tsCol = info.tsCol ? quoteIdent(info.tsCol) : null;
    const from = asFiniteNumber(args.from);
    const to = asFiniteNumber(args.to);
    const useDateFilter = tsCol !== null && (from !== null || to !== null);
    return {
        sql: useDateFilter ? ` AND ${tsCol} BETWEEN ? AND ?` : "",
        args: useDateFilter ? [from ?? 0, to ?? Number.MAX_SAFE_INTEGER] : [],
    };
}
