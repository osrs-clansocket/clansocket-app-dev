import { memoize } from "../../../../../state/caches/memoize.js";
import { MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE, MS_PER_SECOND } from "../../../../../state/time-units.js";

export { setStatus } from "../../../status-line.js";

const timeLeftImpl = (msLeft: number): string => {
    const days = Math.floor(msLeft / MS_PER_DAY);
    if (days >= 1) return `${days} ${days === 1 ? "day" : "days"}`;
    const hours = Math.floor(msLeft / MS_PER_HOUR);
    if (hours >= 1) return `${hours} ${hours === 1 ? "hour" : "hours"}`;
    const minutes = Math.floor(msLeft / MS_PER_MINUTE);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
};

const memoizedFormatTimeLeft = memoize(timeLeftImpl, {
    tag: "render",
    maxEntries: 256,
    keyOf: (msLeft) => String(Math.floor(msLeft / MS_PER_MINUTE)),
});

export function formatTimeLeft(deadlineMs: number, now: number): string {
    return memoizedFormatTimeLeft(Math.max(0, deadlineMs - now));
}

const formatRemainingImpl = (msLeft: number): string => {
    const m = Math.floor(msLeft / MS_PER_MINUTE);
    const s = Math.floor((msLeft % MS_PER_MINUTE) / MS_PER_SECOND);
    return `${m}m ${s}s`;
};

const memoizedFormatRemaining = memoize(formatRemainingImpl, {
    tag: "render",
    maxEntries: 256,
    keyOf: (msLeft) => String(Math.floor(msLeft / MS_PER_SECOND)),
});

export function formatRemaining(expiresAt: number, now: number): string {
    return memoizedFormatRemaining(Math.max(0, expiresAt - now));
}

export const formatVerifiedDate = memoize(
    (ts: number): string => {
        const d = new Date(ts);
        const day = String(d.getUTCDate()).padStart(2, "0");
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${day} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    },
    { tag: "render", maxEntries: 256, keyOf: (ts) => String(ts) },
);
