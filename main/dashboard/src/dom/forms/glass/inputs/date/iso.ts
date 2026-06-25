const SINGLE_DIGIT_MAX = 10;
const ISO_DATE_LEN = 10;
const ISO_DASH_AT_4 = 4;
const ISO_DASH_AT_7 = 7;

function pad2(n: number): string {
    return n < SINGLE_DIGIT_MAX ? `0${n}` : String(n);
}

export function isoDate(d: Date): string {
    return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function isIsoDate(s: string): boolean {
    if (s.length !== ISO_DATE_LEN) return false;
    if (s[ISO_DASH_AT_4] !== "-" || s[ISO_DASH_AT_7] !== "-") return false;
    for (let i = 0; i < s.length; i++) {
        if (i === ISO_DASH_AT_4 || i === ISO_DASH_AT_7) continue;
        const c = s[i];
        if (c < "0" || c > "9") return false;
    }
    return true;
}

export function parseIso(s: string): Date | null {
    if (!isIsoDate(s)) return null;
    const ms = Date.parse(`${s}T00:00:00Z`);
    return Number.isFinite(ms) ? new Date(ms) : null;
}
