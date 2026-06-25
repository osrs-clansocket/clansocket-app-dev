import {
    CHARCODE_DASH,
    CHARCODE_DIGIT_0,
    CHARCODE_DIGIT_9,
    CHARCODE_HASH,
    CHARCODE_LOWER_A,
    CHARCODE_LOWER_Z,
} from "../../../shared/constants/ascii-constants.js";

const FIRST_INDEX = 1;

function inRange(code: number, lo: number, hi: number): boolean {
    return code >= lo && code <= hi;
}

function isLowerAscii(code: number): boolean {
    return inRange(code, CHARCODE_LOWER_A, CHARCODE_LOWER_Z);
}

function isDigitAscii(code: number): boolean {
    return inRange(code, CHARCODE_DIGIT_0, CHARCODE_DIGIT_9);
}

function isKeyChar(code: number): boolean {
    return isLowerAscii(code) || isDigitAscii(code) || code === CHARCODE_DASH;
}

function isAtEnd(s: string, i: number): boolean {
    return i >= s.length;
}

export function isDataKey(s: string): boolean {
    if (s.length === 0) return false;
    if (!isLowerAscii(s.charCodeAt(0))) return false;
    let i = FIRST_INDEX;
    while (!isAtEnd(s, i) && s.charCodeAt(i) !== CHARCODE_HASH) {
        if (!isKeyChar(s.charCodeAt(i))) return false;
        i++;
    }
    if (isAtEnd(s, i)) return true;
    i++;
    if (isAtEnd(s, i)) return false;
    while (!isAtEnd(s, i)) {
        if (!isDigitAscii(s.charCodeAt(i))) return false;
        i++;
    }
    return true;
}
