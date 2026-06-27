import type { MetricAggregation, MetricCategory, MetricFormat } from "./metric-types.js";

export interface MetricColRule {
    readonly agg: MetricAggregation;
    readonly category: MetricCategory;
    readonly label: string;
    readonly format: MetricFormat;
    readonly expr?: string;
    readonly requires?: string;
}

export const METRIC_COL_RULES: Record<string, MetricColRule> = {
    kc: { agg: "SUM", category: "combat", label: "kill count", format: "int" },
    xp: { agg: "SUM", category: "skills", label: "experience", format: "int" },
    level: { agg: "MAX", category: "skills", label: "level", format: "int" },
    qty: { agg: "SUM", category: "items", label: "quantity", format: "int" },
    count: { agg: "SUM", category: "collection", label: "count", format: "int" },
    unit_price_gp: {
        agg: "SUM",
        category: "loot",
        label: "value (gp)",
        format: "gp",
        expr: "qty * unit_price_gp",
        requires: "qty",
    },
    dealt_total: { agg: "SUM", category: "combat", label: "damage dealt", format: "int" },
    taken_total: { agg: "SUM", category: "combat", label: "damage taken", format: "int" },
    hit_count_dealt: { agg: "SUM", category: "combat", label: "hits dealt", format: "int" },
    hit_count_taken: { agg: "SUM", category: "combat", label: "hits taken", format: "int" },
};

export const GROUP_COL_PATTERNS: ReadonlySet<string> = new Set([
    "source_name",
    "skill",
    "item_name",
    "tier",
    "category",
    "task_name",
    "boss_name",
    "cause_name",
    "diary_name",
    "quest_name",
    "source_kind",
    "target_name",
    "damage_type",
]);

export const EXCLUDED_TABLES: ReadonlySet<string> = new Set([
    "plugin_current_state",
    "plugin_connection_status",
    "plugin_identity_drifts",
    "plugin_sessions",
    "plugin_login_state_transitions",
    "plugin_world_hops",
    "plugin_items_catalog",
    "plugin_combat_achievement_catalog",
]);
