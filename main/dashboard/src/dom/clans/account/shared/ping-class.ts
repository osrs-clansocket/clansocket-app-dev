import { memoize } from "../../../../state/caches/memoize.js";

const PING_GOOD = 100;
const PING_OK = 250;

interface PingLevel {
    max: number;
    suffix: "good" | "ok" | "bad";
    short: "g" | "o" | "b";
}

const PING_LEVELS: readonly PingLevel[] = [
    { max: PING_GOOD, suffix: "good", short: "g" },
    { max: PING_OK, suffix: "ok", short: "o" },
    { max: Number.POSITIVE_INFINITY, suffix: "bad", short: "b" },
];

const UNKNOWN_LEVEL = { suffix: "unknown" as const, short: "u" as const };

function pingLevel(pingMs: number | null | undefined): { suffix: string; short: string } {
    if (typeof pingMs !== "number" || !Number.isFinite(pingMs)) return UNKNOWN_LEVEL;
    for (const lvl of PING_LEVELS) if (pingMs < lvl.max) return lvl;
    return PING_LEVELS[PING_LEVELS.length - 1] as PingLevel;
}

const pingClassImpl = (pingMs: number | null | undefined): string =>
    `account__session-ping account__session-ping--${pingLevel(pingMs).suffix}`;

const pingClassByBucket = memoize(pingClassImpl, {
    tag: "render",
    maxEntries: 8,
    keyOf: (pingMs) => pingLevel(pingMs).short,
});

export function pingClass(pingMs: number | null | undefined): string {
    return pingClassByBucket(pingMs);
}
