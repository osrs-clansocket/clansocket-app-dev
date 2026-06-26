import { readWord } from "./scanner-sql.js";

function unquoteIdent(raw: string): string {
    if (raw.length < 2) return raw;
    const first = raw[0];
    const last = raw[raw.length - 1];
    if ((first === '"' && last === '"') || (first === "`" && last === "`")) {
        return raw.slice(1, -1);
    }
    if (first === "[" && last === "]") return raw.slice(1, -1);
    return raw;
}

export function readTableName(sql: string, i: number): string | null {
    const t = readWord(sql, i);
    if (t.word.length === 0) return null;
    return unquoteIdent(t.word);
}
