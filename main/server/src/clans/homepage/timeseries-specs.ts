const HOUR_MS = 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * HOUR_MS;

export interface TimeseriesSpec {
    readonly key: string;
    readonly table: string;
    readonly timeCol: string;
    readonly valueExpr: string;
    readonly bucketMs: number;
    readonly windowMs: number;
}

export const TIMESERIES_SPECS: ReadonlyArray<TimeseriesSpec> = [
    {
        key: "clan_xp_7d",
        table: "plugin_stats_changes",
        timeCol: "event_received_at",
        valueExpr: "(xp_after - xp_before)",
        bucketMs: HOUR_MS,
        windowMs: SEVEN_DAYS_MS,
    },
    {
        key: "clan_loot_value_7d",
        table: "plugin_loot_drops",
        timeCol: "event_received_at",
        valueExpr: "(qty * COALESCE(unit_price_gp, 0))",
        bucketMs: HOUR_MS,
        windowMs: SEVEN_DAYS_MS,
    },
    {
        key: "clan_deaths_7d",
        table: "plugin_deaths",
        timeCol: "event_received_at",
        valueExpr: "1",
        bucketMs: HOUR_MS,
        windowMs: SEVEN_DAYS_MS,
    },
];
