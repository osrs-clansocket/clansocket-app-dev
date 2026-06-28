import type { ReadSignal } from "../../../dom/factory/reactive";
import type { ClanRosterMember, ManagedClan } from "../clans-client/index.js";
import { defaultThumbUrl } from "../../../dom/factory/data-ops/identity/clan-icon-url.js";
import type { MetricValue } from "./homepage-metrics-store.js";
import type { HeatmapCell } from "./homepage-heatmaps-store.js";
import type { TimeseriesPoint } from "./homepage-timeseries-store.js";

export interface HomepageContext {
    readonly clan: ManagedClan;
    readonly memberCount: number;
    readonly iconUrl: string;
    readonly establishedYear: number | null;
    readonly metrics: ReadSignal<Map<string, MetricValue>>;
    readonly heatmaps: ReadSignal<Map<string, HeatmapCell[]>>;
    readonly timeseries: ReadSignal<Map<string, TimeseriesPoint[]>>;
}

const VARIABLE_PATTERN = /\{\{\s*([a-z][a-z0-9_.]*)\s*\}\}/gi;

function formatMetric(m: MetricValue): string {
    if (m.format === "gp") return `${m.value.toLocaleString()} gp`;
    return m.value.toLocaleString();
}

function lookup(ctx: HomepageContext, key: string): string {
    const metric = ctx.metrics().get(key);
    if (metric !== undefined) return formatMetric(metric);
    switch (key) {
        case "clan.name":
            return ctx.clan.displayName;
        case "clan.slug":
            return ctx.clan.slug;
        case "clan.status":
            return ctx.clan.status;
        case "clan.memberCount":
            return String(ctx.memberCount);
        case "clan.establishedYear":
            return ctx.establishedYear !== null ? String(ctx.establishedYear) : "—";
        default:
            return `{{${key}}}`;
    }
}

export function interpolate(text: string, ctx: HomepageContext): string {
    return text.replace(VARIABLE_PATTERN, (_match, key: string) => lookup(ctx, key));
}

export const HOMEPAGE_VARIABLES: ReadonlyArray<{ key: string; description: string }> = [
    { key: "clan.name", description: "Clan display name" },
    { key: "clan.slug", description: "Clan slug" },
    { key: "clan.status", description: "Clan status (active / archived)" },
    { key: "clan.memberCount", description: "Total member count from latest roster" },
    { key: "clan.establishedYear", description: "Year of the earliest member join (roster-derived)" },
];

function earliestJoinYear(members: readonly ClanRosterMember[]): number | null {
    let earliestMs: number | null = null;
    for (const m of members) {
        if (m.joinedAt === null) continue;
        const ms = Date.parse(m.joinedAt);
        if (Number.isNaN(ms)) continue;
        if (earliestMs === null || ms < earliestMs) earliestMs = ms;
    }
    if (earliestMs === null) return null;
    return new Date(earliestMs).getUTCFullYear();
}

export function buildContext(
    clan: ManagedClan,
    metrics: ReadSignal<Map<string, MetricValue>>,
    heatmaps: ReadSignal<Map<string, HeatmapCell[]>>,
    timeseries: ReadSignal<Map<string, TimeseriesPoint[]>>,
): HomepageContext {
    const memberCount = clan.roster?.memberCount ?? 0;
    const iconUrl = defaultThumbUrl(clan.slug);
    const members = clan.roster?.members ?? [];
    const establishedYear = earliestJoinYear(members);
    return { clan, memberCount, iconUrl, establishedYear, metrics, heatmaps, timeseries };
}
