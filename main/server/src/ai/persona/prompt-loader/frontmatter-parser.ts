const LITERAL_VALUES: Record<string, unknown> = { true: true, false: false, null: null };

function atEnd(s: string, i: number): boolean {
    return i === s.length;
}

function scanDigits(s: string, start: number): number {
    let i = start;
    while (i < s.length && s[i] >= "0" && s[i] <= "9") i++;
    return i;
}

function isNumericLiteral(s: string): boolean {
    let i = s[0] === "-" ? 1 : 0;
    if (atEnd(s, i)) return false;
    const intEnd = scanDigits(s, i);
    if (intEnd === i) return false;
    i = intEnd;
    if (atEnd(s, i)) return true;
    if (s[i] !== ".") return false;
    i++;
    const fracEnd = scanDigits(s, i);
    return fracEnd > i && atEnd(s, fracEnd);
}

function bracketedBy(s: string, open: string, close: string): boolean {
    return s.startsWith(open) && s.endsWith(close);
}

function parseStructure(s: string): unknown {
    if (!bracketedBy(s, "[", "]") && !bracketedBy(s, "{", "}")) return undefined;
    try {
        return JSON.parse(s);
    } catch {
        return s;
    }
}

function stripQuotes(s: string): string | undefined {
    if (bracketedBy(s, '"', '"') || bracketedBy(s, "'", "'")) return s.slice(1, -1);
    return undefined;
}

export function parseFrontmatterValue(raw: string): unknown {
    const s = raw.trim();
    if (Object.prototype.hasOwnProperty.call(LITERAL_VALUES, s)) return LITERAL_VALUES[s];
    if (isNumericLiteral(s)) return Number(s);
    const structured = parseStructure(s);
    if (structured !== undefined) return structured;
    const quoted = stripQuotes(s);
    if (quoted !== undefined) return quoted;
    return s;
}
