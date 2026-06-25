import {
    CHARCODE_LOWER_A,
    CHARCODE_LOWER_Z,
    CHARCODE_UPPER_A,
    CHARCODE_UPPER_Z,
} from "../../../../../shared/constants/ascii-constants.js";
import { isDigitChar } from "./render-markdown-digit.js";

const CODE_CHAR_PUNCTUATION = new Set(["_", "-", " ", "'", "."]);

export function isCodeChar(ch: string): boolean {
    const code = ch.charCodeAt(0);
    const isUpper = code >= CHARCODE_UPPER_A && code <= CHARCODE_UPPER_Z;
    const isLower = code >= CHARCODE_LOWER_A && code <= CHARCODE_LOWER_Z;
    if (isDigitChar(code) || isUpper || isLower) return true;
    return CODE_CHAR_PUNCTUATION.has(ch);
}
