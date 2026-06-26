import { readWord } from "./scanner-sql.js";

export function expectKeyword(sql: string, start: number, keyword: string): number | null {
    const w = readWord(sql, start);
    return w.word.toUpperCase() === keyword ? w.next : null;
}
