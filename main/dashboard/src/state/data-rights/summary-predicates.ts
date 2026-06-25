import { MAX_VALUE_LEN_FACTOR, MS_EPOCH_MIN } from "./summary-constants.js";

function isSummaryInteger(s: string): boolean {
    const body = s.startsWith("-") ? s.slice(1) : s;
    if (body.length === 0) return false;
    for (const ch of body) {
        if (ch < "0" || ch > "9") return false;
    }
    return true;
}

export function isPrimarySummary(s: string): boolean {
    if (s.length === 0) return false;
    if (isSummaryInteger(s)) return false;
    return s.length <= MAX_VALUE_LEN_FACTOR * MS_EPOCH_MIN.toString().length;
}
