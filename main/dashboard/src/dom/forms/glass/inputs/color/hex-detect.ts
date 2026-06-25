import {
    CHARCODE_DIGIT_0,
    CHARCODE_DIGIT_9,
    CHARCODE_LOWER_A,
    CHARCODE_LOWER_F,
    CHARCODE_UPPER_A,
    CHARCODE_UPPER_F,
} from "../../../../../shared/constants/ascii-constants.js";

export function isHexChar(c: string): boolean {
    const code = c.charCodeAt(0);
    if (code >= CHARCODE_DIGIT_0 && code <= CHARCODE_DIGIT_9) return true;
    if (code >= CHARCODE_UPPER_A && code <= CHARCODE_UPPER_F) return true;
    if (code >= CHARCODE_LOWER_A && code <= CHARCODE_LOWER_F) return true;
    return false;
}

export function hasHexChars(body: string, length: number): boolean {
    if (body.length !== length) return false;
    for (let i = 0; i < length; i++) if (!isHexChar(body.charAt(i))) return false;
    return true;
}
