import { CHARCODE_DIGIT_0, CHARCODE_DIGIT_9 } from "../../../../../shared/constants/ascii-constants.js";

export function isDigitChar(charCode: number): boolean {
    return charCode >= CHARCODE_DIGIT_0 && charCode <= CHARCODE_DIGIT_9;
}

export function isAllDigits(s: string): boolean {
    for (let k = 0; k < s.length; k++) if (!isDigitChar(s.charCodeAt(k))) return false;
    return true;
}
