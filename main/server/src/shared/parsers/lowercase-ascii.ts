import { ASCII_UPPER_TO_LOWER_OFFSET } from "./ascii-codes.js";
import { isAsciiUpper } from "./predicate-ascii.js";

export function lowercaseAsciiChar(ch: string): string {
    const code = ch.charCodeAt(0);
    if (isAsciiUpper(code)) return String.fromCharCode(code + ASCII_UPPER_TO_LOWER_OFFSET);
    return ch;
}

export function lowercaseAsciiString(s: string): string {
    const parts: string[] = [];
    for (const c of s) parts.push(lowercaseAsciiChar(c));
    return parts.join("");
}
