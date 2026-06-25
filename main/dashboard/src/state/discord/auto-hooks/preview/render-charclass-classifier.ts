import {
    ASCII_CASE_OFFSET,
    CHARCODE_DIGIT_0,
    CHARCODE_DIGIT_9,
    CHARCODE_LOWER_A,
    CHARCODE_LOWER_Z,
    CHARCODE_UPPER_A,
    CHARCODE_UPPER_Z,
} from "../../../../shared/constants/ascii-constants.js";

function isDigit(code: number): boolean {
    return code >= CHARCODE_DIGIT_0 && code <= CHARCODE_DIGIT_9;
}

function isLower(code: number): boolean {
    return code >= CHARCODE_LOWER_A && code <= CHARCODE_LOWER_Z;
}

function isUpper(code: number): boolean {
    return code >= CHARCODE_UPPER_A && code <= CHARCODE_UPPER_Z;
}

export function normalizeChar(c: string): string {
    const code = c.charCodeAt(0);
    if (isDigit(code) || isLower(code)) return c;
    if (isUpper(code)) return String.fromCharCode(code + ASCII_CASE_OFFSET);
    if (c === " " || c === "-" || c === "_") return "_";
    return "";
}
