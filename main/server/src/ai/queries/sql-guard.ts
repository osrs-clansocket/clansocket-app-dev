import { isKeywordAt, isWhitespace, isWordChar } from "./sql-char-predicates.js";

export { containsBlockedKeyword } from "./sql-blocked-check.js";

const SQL_KEYWORD_LENGTH = 4;

export function extractTableReferences(sql: string): string[] {
    const upper = sql.toUpperCase();
    const tables: string[] = [];
    let i = 0;
    while (i < upper.length) {
        const isFrom = isKeywordAt(upper, i, "FROM");
        const isJoin = !isFrom && isKeywordAt(upper, i, "JOIN");
        if (!isFrom && !isJoin) {
            i++;
            continue;
        }
        i += SQL_KEYWORD_LENGTH;
        while (i < sql.length && isWhitespace(sql[i]!)) i++;
        const start = i;
        while (i < sql.length && isWordChar(sql[i]!)) i++;
        if (i > start) tables.push(sql.slice(start, i).toLowerCase());
    }
    return tables;
}

export function tablesAllowed(sql: string, allowed: ReadonlySet<string>): { ok: boolean; offending?: string } {
    const refs = extractTableReferences(sql);
    for (const t of refs) {
        if (!allowed.has(t)) return { ok: false, offending: t };
    }
    return { ok: true };
}
