import {
    ASCII_CASE_OFFSET,
    CHARCODE_DIGIT_0,
    CHARCODE_DIGIT_9,
    CHARCODE_LOWER_A,
    CHARCODE_LOWER_Z,
    CHARCODE_UPPER_A,
    CHARCODE_UPPER_Z,
} from "../../../shared/constants/ascii-constants.js";

const UNDERSCORE = "_";
const EMPTY = "";

type CharClass = "lower" | "upper" | "digit" | "other";

function classifyChar(ch: number): CharClass {
    if (ch >= CHARCODE_LOWER_A && ch <= CHARCODE_LOWER_Z) return "lower";
    if (ch >= CHARCODE_UPPER_A && ch <= CHARCODE_UPPER_Z) return "upper";
    if (ch >= CHARCODE_DIGIT_0 && ch <= CHARCODE_DIGIT_9) return "digit";
    return "other";
}

function appendChar(state: { out: string; lastUnderscore: boolean }, ch: number, src: string, i: number): void {
    const cls = classifyChar(ch);
    if (cls === "lower" || cls === "digit") {
        state.out += src.charAt(i);
        state.lastUnderscore = false;
    } else if (cls === "upper") {
        state.out += String.fromCharCode(ch + ASCII_CASE_OFFSET);
        state.lastUnderscore = false;
    } else if (!state.lastUnderscore && state.out.length > 0) {
        state.out += UNDERSCORE;
        state.lastUnderscore = true;
    }
}

export function slugifyAssetKey(value: unknown): string {
    if (value === null || value === undefined) return EMPTY;
    const s = String(value);
    const state = { out: EMPTY, lastUnderscore: false };
    for (let i = 0; i < s.length; i++) appendChar(state, s.charCodeAt(i), s, i);
    return state.out.endsWith(UNDERSCORE) ? state.out.slice(0, -1) : state.out;
}
