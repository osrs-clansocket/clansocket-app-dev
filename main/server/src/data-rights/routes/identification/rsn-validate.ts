import { RSN_MAX_LEN } from "../../../database/index.js";
import { ASCII_HYPHEN, ASCII_SPACE, ASCII_UNDERSCORE } from "../../../shared/parsers/ascii-codes.js";
import { isAsciiAlphanumeric } from "../../../shared/parsers/predicate-ascii.js";

function isRsnChar(c: number): boolean {
    return isAsciiAlphanumeric(c) || c === ASCII_SPACE || c === ASCII_UNDERSCORE || c === ASCII_HYPHEN;
}

export function validRsn(value: unknown): value is string {
    if (typeof value !== "string") return false;
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > RSN_MAX_LEN) return false;
    for (let i = 0; i < trimmed.length; i++) {
        if (!isRsnChar(trimmed.charCodeAt(i))) return false;
    }
    return true;
}
