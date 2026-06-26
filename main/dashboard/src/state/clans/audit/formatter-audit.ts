import type { ClanAuditEntry, ClanRosterDiff } from "../clans-client/index.js";
import { MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE, MS_PER_SECOND } from "../../time-units.js";

export { MS_PER_HOUR as HOUR_MS, MS_PER_DAY as DAY_MS };

const DAYS_PER_MONTH = 30;
const MS_PER_MONTH = DAYS_PER_MONTH * MS_PER_DAY;
const ACTOR_ID_DISPLAY_LEN = 8;

interface DurTier {
    readonly limit: number;
    readonly div: number;
    readonly suffix: string;
}

const tier = (limit: number, div: number, suffix: string): DurTier => ({ limit, div, suffix });

const RELATIVE_TIERS: readonly DurTier[] = [
    tier(MS_PER_MINUTE, MS_PER_SECOND, "s"),
    tier(MS_PER_HOUR, MS_PER_MINUTE, "m"),
    tier(MS_PER_DAY, MS_PER_HOUR, "h"),
    tier(MS_PER_MONTH, MS_PER_DAY, "d"),
];

function pickTier(ms: number): DurTier | null {
    for (const t of RELATIVE_TIERS) if (ms < t.limit) return t;
    return null;
}

export function fmtRelative(ts: number): string {
    const diff = Date.now() - ts;
    if (diff < 0) return "just now";
    const t = pickTier(diff);
    return t ? `${Math.floor(diff / t.div)}${t.suffix} ago` : `${Math.floor(diff / MS_PER_MONTH)}mo ago`;
}

export function fmtActor(entry: ClanAuditEntry): string {
    if (entry.actorDisplay !== null && entry.actorDisplay.length > 0) return entry.actorDisplay;
    if (entry.actorSiteAccountId === null) return "system";
    const id = entry.actorSiteAccountId;
    return id.length > ACTOR_ID_DISPLAY_LEN ? `${id.slice(0, ACTOR_ID_DISPLAY_LEN)}…` : id;
}

const DIFF_EVENT_RENDERERS: Record<string, (d: ClanRosterDiff) => string> = {
    member_joined: (d) => `joined as ${d.newValue ?? "?"}`,
    member_left: (d) => `left (was ${d.oldValue ?? "?"})`,
};

export function fmtDiffEvent(diff: ClanRosterDiff): string {
    const renderer = DIFF_EVENT_RENDERERS[diff.eventType];
    if (renderer) return renderer(diff);
    return `rank ${diff.oldValue ?? "?"} → ${diff.newValue ?? "?"}`;
}

export function fmtDiff(v: unknown): string {
    if (v === null || v === undefined) return "—";
    if (typeof v === "string") return v;
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    return JSON.stringify(v);
}

export function fmtSpan(earliestTs: number | null, latestTs: number | null): string {
    if (earliestTs === null || latestTs === null) return "";
    const spanMs = latestTs - earliestTs;
    if (spanMs < MS_PER_SECOND) return "under a second";
    const t = pickTier(spanMs);
    return t ? `${Math.round(spanMs / t.div)}${t.suffix}` : `${Math.round(spanMs / MS_PER_DAY)}d`;
}
