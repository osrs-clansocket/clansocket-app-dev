import { memoize } from "../../../../state/caches/memoize.js";
import { HOURS_PER_DAY, MINUTES_PER_HOUR, MS_PER_SECOND, SECONDS_PER_MINUTE } from "../../../../state/time-units.js";
import {
    CHARCODE_DIGIT_0,
    CHARCODE_DIGIT_9,
    CHARCODE_LOWER_A,
    CHARCODE_LOWER_F,
    CHARCODE_UPPER_A,
    CHARCODE_UPPER_F,
} from "../../../../shared/constants/ascii-constants.js";

export { pingClass } from "./ping-class.js";

export const HEX_LEN = 7;
export const HEX_BODY_LEN = 6;

function inRange(code: number, lo: number, hi: number): boolean {
    return code >= lo && code <= hi;
}

export function isHexChar(code: number): boolean {
    return (
        inRange(code, CHARCODE_DIGIT_0, CHARCODE_DIGIT_9) ||
        inRange(code, CHARCODE_LOWER_A, CHARCODE_LOWER_F) ||
        inRange(code, CHARCODE_UPPER_A, CHARCODE_UPPER_F)
    );
}

export function isHexColor(str: string): boolean {
    if (str.length !== HEX_LEN) return false;
    if (str[0] !== "#") return false;
    for (let i = 1; i <= HEX_BODY_LEN; i++) {
        if (!isHexChar(str.charCodeAt(i))) return false;
    }
    return true;
}

export function normalizeHex(raw: string): string | null {
    const trimmed = raw.trim().toLowerCase();
    const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
    return isHexColor(withHash) ? withHash : null;
}

const fmtUptimeBySecs = memoize(
    (secs: number): string => {
        if (secs < 0) return "—";
        if (secs < SECONDS_PER_MINUTE) return `${secs}s`;
        const mins = Math.floor(secs / SECONDS_PER_MINUTE);
        if (mins < MINUTES_PER_HOUR) return `${mins}m`;
        const hours = Math.floor(mins / MINUTES_PER_HOUR);
        const remMins = mins % MINUTES_PER_HOUR;
        if (hours < HOURS_PER_DAY) return remMins > 0 ? `${hours}h ${remMins}m` : `${hours}h`;
        const days = Math.floor(hours / HOURS_PER_DAY);
        const remHours = hours % HOURS_PER_DAY;
        return remHours > 0 ? `${days}d ${remHours}h` : `${days}d`;
    },
    { tag: "render", maxEntries: 256, keyOf: (secs) => String(secs) },
);

export function fmtUptime(connectedAt: number | null | undefined): string {
    if (typeof connectedAt !== "number" || !Number.isFinite(connectedAt) || connectedAt <= 0) return "—";
    const secs = Math.max(0, Math.floor((Date.now() - connectedAt) / MS_PER_SECOND));
    return fmtUptimeBySecs(secs);
}
