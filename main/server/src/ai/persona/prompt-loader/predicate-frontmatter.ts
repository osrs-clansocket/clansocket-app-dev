import { scanDigits } from "./scanner-frontmatter.js";

export function isNumericLiteral(s: string): boolean {
    const end = s.length;
    const start = s[0] === "-" ? 1 : 0;
    const intEnd = scanDigits(s, start);
    if (intEnd <= start) return false;
    if (intEnd === end) return true;
    if (s[intEnd] !== ".") return false;
    const fracStart = intEnd + 1;
    const fracEnd = scanDigits(s, fracStart);
    return fracEnd > fracStart && fracEnd === end;
}

export function bracketedBy(s: string, open: string, close: string): boolean {
    return s.startsWith(open) && s.endsWith(close);
}
