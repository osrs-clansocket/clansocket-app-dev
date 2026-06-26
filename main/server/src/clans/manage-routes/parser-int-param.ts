import { asString } from "../../shared/coerce.js";
import { parseDecimal } from "../../shared/parsers/decimal-parser.js";

export function parseIntParam(value: unknown, fallback: number): number {
    const s = asString(value);
    if (s === null) return fallback;
    const n = parseDecimal(s);
    return Number.isFinite(n) ? n : fallback;
}
