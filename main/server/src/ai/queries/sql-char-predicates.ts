import { inRange } from "../../shared/parsers/ascii-bounds.js";

function isAlphaDigit(ch: string): boolean {
    return inRange(ch, "A", "Z") || inRange(ch, "a", "z") || inRange(ch, "0", "9");
}

export function isWordChar(ch: string): boolean {
    return isAlphaDigit(ch) || ch === "_";
}

export function isWhitespace(ch: string): boolean {
    return ch === " " || ch === "\t" || ch === "\n" || ch === "\r";
}

export function isKeywordAt(upper: string, at: number, keyword: string): boolean {
    if (at + keyword.length > upper.length) return false;
    if (at > 0 && isWordChar(upper[at - 1]!)) return false;
    for (let j = 0; j < keyword.length; j++) {
        if (upper[at + j] !== keyword[j]) return false;
    }
    const tail = at + keyword.length;
    if (tail < upper.length && isWordChar(upper[tail]!)) return false;
    return true;
}
