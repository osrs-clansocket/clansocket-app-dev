import { isKeywordAt } from "./sql-char-predicates.js";

const BLOCKED_KEYWORDS = [
    "INSERT",
    "UPDATE",
    "DELETE",
    "DROP",
    "ALTER",
    "CREATE",
    "ATTACH",
    "DETACH",
    "PRAGMA",
    "VACUUM",
    "REINDEX",
] as const;

export function containsBlockedKeyword(sql: string): string | null {
    const upper = sql.toUpperCase();
    for (let i = 0; i < upper.length; i++) {
        for (const kw of BLOCKED_KEYWORDS) {
            if (isKeywordAt(upper, i, kw)) return kw.toLowerCase();
        }
    }
    return null;
}
