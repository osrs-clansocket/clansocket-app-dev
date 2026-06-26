import { isAsciiDigit, isAsciiLower, isAsciiUpper } from "../../../shared/parsers/predicate-ascii.js";
import { lowercaseAsciiChar } from "../../../shared/parsers/lowercase-ascii.js";

function normalizeChar(c: string, keepSeparators: boolean): string {
    const code = c.charCodeAt(0);
    if (isAsciiDigit(code) || isAsciiLower(code)) return c;
    if (isAsciiUpper(code)) return lowercaseAsciiChar(c);
    if (keepSeparators && (c === " " || c === "-" || c === "_")) return "_";
    return "";
}

export function buildLookupCandidates(name: string): string[] {
    const normalize = (keepSeparators: boolean): string =>
        Array.from(name, (c) => normalizeChar(c, keepSeparators)).join("");
    const candidates = [name];
    const normalized = normalize(true);
    if (normalized !== name) candidates.push(normalized);
    const compact = normalize(false);
    if (compact.length > 0 && compact !== normalized) candidates.push(compact);
    return candidates;
}
