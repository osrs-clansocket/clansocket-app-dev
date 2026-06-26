const WS_CHARS = new Set([" ", "\t", "\n", "\r"]);
const IDENT_TERMINATORS = new Set([" ", "\t", "\n", "\r", "(", ",", ";", ".", "\0"]);

export function skipWs(s: string, i: number): number {
    while (i < s.length && WS_CHARS.has(s[i])) i++;
    return i;
}

export function readWord(s: string, i: number): { word: string; next: number } {
    const start = i;
    while (i < s.length && !IDENT_TERMINATORS.has(s[i])) i++;
    return { word: s.slice(start, i), next: i };
}

export function skipOrAlternative(sql: string, start: number): number {
    const i = skipWs(sql, start);
    const orCandidate = readWord(sql, i);
    if (orCandidate.word.toUpperCase() !== "OR") return skipWs(sql, start);
    const action = readWord(sql, skipWs(sql, orCandidate.next));
    return skipWs(sql, action.next);
}
