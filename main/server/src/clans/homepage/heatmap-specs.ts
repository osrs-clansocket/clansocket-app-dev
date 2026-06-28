export interface HeatmapSpec {
    readonly key: string;
    readonly table: string;
    readonly rowCol: string;
    readonly colCol: string;
    readonly valueExpr: string;
    readonly valueAgg: "SUM" | "MAX" | "COUNT";
    readonly topNCols: number;
}

export const HEATMAP_SPECS: ReadonlyArray<HeatmapSpec> = [
    {
        key: "player_boss_kc",
        table: "plugin_npc_kc",
        rowCol: "rsn",
        colCol: "source_name",
        valueExpr: "kc",
        valueAgg: "SUM",
        topNCols: 10,
    },
    {
        key: "player_skill_xp",
        table: "plugin_stats",
        rowCol: "rsn",
        colCol: "skill",
        valueExpr: "xp",
        valueAgg: "SUM",
        topNCols: 23,
    },
];
