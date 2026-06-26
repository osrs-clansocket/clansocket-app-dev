import { readWord, skipOrAlternative, skipWs } from "./scanner-sql.js";
import { expectKeyword } from "./validator-sql-keyword.js";
import { readTableName } from "./reader-sql-table.js";
import type { WriteSig } from "./sql-write-types.js";

export type { WriteSig } from "./sql-write-types.js";

function parseInsert(sql: string, start: number, kw: string): WriteSig | null {
    const intoEnd = expectKeyword(sql, skipOrAlternative(sql, start), "INTO");
    if (intoEnd === null) return null;
    const table = readTableName(sql, skipWs(sql, intoEnd));
    return table === null ? null : { kind: kw === "INSERT" ? "insert" : "replace", table };
}

function parseUpdate(sql: string, start: number): WriteSig | null {
    const table = readTableName(sql, skipOrAlternative(sql, start));
    return table === null ? null : { kind: "update", table };
}

function parseDelete(sql: string, start: number): WriteSig | null {
    const fromEnd = expectKeyword(sql, skipWs(sql, start), "FROM");
    if (fromEnd === null) return null;
    const table = readTableName(sql, skipWs(sql, fromEnd));
    return table === null ? null : { kind: "delete", table };
}

const VERB_PARSERS: Record<string, (sql: string, start: number, kw: string) => WriteSig | null> = {
    INSERT: parseInsert,
    REPLACE: parseInsert,
    UPDATE: (sql, start) => parseUpdate(sql, start),
    DELETE: (sql, start) => parseDelete(sql, start),
};

export function extractWrite(sql: string): WriteSig | null {
    const head = readWord(sql, skipWs(sql, 0));
    const kw = head.word.toUpperCase();
    return VERB_PARSERS[kw]?.(sql, head.next, kw) ?? null;
}
