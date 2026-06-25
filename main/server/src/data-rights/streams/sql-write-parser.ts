import type { DbWriteKind } from "./writes-stream.js";

const WS_CHARS = new Set([" ", "\t", "\n", "\r"]);
const IDENT_TERMINATORS = new Set([" ", "\t", "\n", "\r", "(", ",", ";", ".", "\0"]);

function skipWs(s: string, i: number): number {
    while (i < s.length && WS_CHARS.has(s[i])) i++;
    return i;
}

function readWord(s: string, i: number): { word: string; next: number } {
    const start = i;
    while (i < s.length && !IDENT_TERMINATORS.has(s[i])) i++;
    return { word: s.slice(start, i), next: i };
}

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

export interface WriteSig {
    kind: DbWriteKind;
    table: string;
}

function expectKeyword(sql: string, start: number, keyword: string): number | null {
    const w = readWord(sql, start);
    return w.word.toUpperCase() === keyword ? w.next : null;
}

function skipOrAction(sql: string, start: number): number {
    const i = skipWs(sql, start);
    const orEnd = expectKeyword(sql, i, "OR");
    if (orEnd === null) return start;
    const action = readWord(sql, skipWs(sql, orEnd));
    return skipWs(sql, action.next);
}

function readTableName(sql: string, i: number): string | null {
    const t = readWord(sql, i);
    if (t.word.length === 0) return null;
    return unquoteIdent(t.word);
}

function skipOrAlternative(sql: string, start: number): number {
    const after = skipOrAction(sql, start);
    return after === start ? skipWs(sql, start) : after;
}

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
