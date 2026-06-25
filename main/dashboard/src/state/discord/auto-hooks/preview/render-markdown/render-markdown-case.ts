import { ASCII_CASE_OFFSET } from "../../../../../shared/constants/ascii-constants.js";
import { isUpperCode } from "./is-upper-code.js";

export function lowercaseAscii(s: string): string {
    const parts: string[] = [];
    for (const c of s) {
        const code = c.charCodeAt(0);
        parts.push(isUpperCode(code) ? String.fromCharCode(code + ASCII_CASE_OFFSET) : c);
    }
    return parts.join("");
}
