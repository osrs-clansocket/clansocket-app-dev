import { ASCII_UPPER_TO_LOWER_OFFSET, isAsciiUpper } from "./ascii-bounds.js";

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
