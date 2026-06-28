import type { SpecByKind } from "../../../charts/factory.js";
import type { BarSpec } from "../../../charts/kinds/bar.js";
import type { DoughnutSpec } from "../../../charts/kinds/doughnut.js";
import type { HeatmapSpec, HeatmapCell as ChartHeatmapCell } from "../../../charts/kinds/heatmap.js";
import type { TimeLineSpec } from "../../../charts/kinds/time-line.js";
import type { HomepageContext } from "./homepage-variables.js";
import type { MetricValue } from "./homepage-metrics-store.js";

export type ChartCardKind = keyof SpecByKind;
export type ChartCategory = "highscores" | "skills" | "combat" | "loot" | "activity";
export type ChartCardShape = "chart" | "kpi";

export interface ChartPreset<K extends ChartCardKind = ChartCardKind> {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    readonly category: ChartCategory;
    readonly kind: K;
    readonly card: ChartCardShape;
    readonly recommendedSize?: { readonly w: number; readonly h: number };
    buildSpec(ctx: HomepageContext): SpecByKind[K] | null;
}

const SIZE_BAR = { w: 320, h: 240 };
const SIZE_DOUGHNUT = { w: 320, h: 280 };
const SIZE_RADAR = { w: 320, h: 320 };
const SIZE_HEATMAP = { w: 480, h: 320 };
const SIZE_TIMELINE = { w: 560, h: 240 };

export function defaultSizeFor(kind: ChartCardKind): { w: number; h: number } {
    if (kind === "bar") return SIZE_BAR;
    if (kind === "doughnut") return SIZE_DOUGHNUT;
    if (kind === "radar") return SIZE_RADAR;
    if (kind === "heatmap") return SIZE_HEATMAP;
    return SIZE_TIMELINE;
}

const TOP_N = 10;

interface NamedValue {
    readonly slug: string;
    readonly value: number;
}

function pickByPrefix(metrics: Map<string, MetricValue>, prefix: string): NamedValue[] {
    const out: NamedValue[] = [];
    for (const [key, m] of metrics) {
        if (!key.startsWith(prefix)) continue;
        out.push({ slug: key.slice(prefix.length), value: m.value });
    }
    return out;
}

function topN(items: NamedValue[], n: number): NamedValue[] {
    return [...items].sort((a, b) => b.value - a.value).slice(0, n);
}

function slugToLabel(slug: string): string {
    return slug.replace(/_/g, " ");
}

function toBarData(items: NamedValue[]): BarSpec["data"] {
    return items.map((i) => ({ label: slugToLabel(i.slug), value: i.value }));
}

function toDoughnutData(items: NamedValue[]): DoughnutSpec["data"] {
    return items.map((i) => ({ label: slugToLabel(i.slug), value: i.value }));
}

function presetBar(
    id: string,
    label: string,
    description: string,
    category: ChartCategory,
    metricPrefix: string,
    valueLabel: string,
): ChartPreset<"bar"> {
    return {
        id,
        label,
        description,
        category,
        kind: "bar",
        card: "chart",
        buildSpec: (ctx) => {
            const items = topN(pickByPrefix(ctx.metrics(), metricPrefix), TOP_N);
            if (items.length === 0) return null;
            return { data: toBarData(items), indexAxis: "y", valueLabel };
        },
    };
}

function presetDoughnut(
    id: string,
    label: string,
    description: string,
    category: ChartCategory,
    metricPrefix: string,
    valueLabel: string,
): ChartPreset<"doughnut"> {
    return {
        id,
        label,
        description,
        category,
        kind: "doughnut",
        card: "chart",
        buildSpec: (ctx) => {
            const items = topN(pickByPrefix(ctx.metrics(), metricPrefix), TOP_N);
            if (items.length === 0) return null;
            return { data: toDoughnutData(items), valueLabel, showLegend: true };
        },
    };
}

const SKILL_ORDER: ReadonlyArray<string> = [
    "attack", "strength", "defence", "ranged", "prayer", "magic", "runecraft", "construction",
    "hitpoints", "agility", "herblore", "thieving", "crafting", "fletching", "slayer",
    "hunter", "mining", "smithing", "fishing", "cooking", "firemaking", "woodcutting", "farming",
];

const radarSkillsPreset: ChartPreset<"radar"> = {
    id: "clan-skills-radar",
    label: "Clan skill levels",
    description: "Aggregate level per skill, plotted across all skill axes.",
    category: "skills",
    kind: "radar",
    card: "chart",
    buildSpec: (ctx) => {
        const metrics = ctx.metrics();
        const data: Array<{ label: string; value: number }> = [];
        for (const skill of SKILL_ORDER) {
            const m = metrics.get(`clan.stats.level.by_skill.${skill}`);
            if (m === undefined) continue;
            data.push({ label: slugToLabel(skill), value: m.value });
        }
        if (data.length === 0) return null;
        return { series: [{ label: "Clan total", data }], valueLabel: "Level" };
    },
};

function buildHeatmap(cells: ChartHeatmapCell[], valueLabel: string): HeatmapSpec | null {
    if (cells.length === 0) return null;
    const xSet = new Set<string>();
    const ySet = new Set<string>();
    for (const c of cells) {
        xSet.add(c.x);
        ySet.add(c.y);
    }
    return {
        data: cells,
        xLabels: [...xSet].sort(),
        yLabels: [...ySet].sort(),
        valueLabel,
    };
}

const playerBossKcHeatmap: ChartPreset<"heatmap"> = {
    id: "player-boss-kc-heatmap",
    label: "Player × boss KC",
    description: "Kill counts per clan member at the top 10 bosses.",
    category: "combat",
    kind: "heatmap",
    card: "chart",
    buildSpec: (ctx) => buildHeatmap(ctx.heatmaps().get("player_boss_kc") ?? [], "KC"),
};

const playerSkillXpHeatmap: ChartPreset<"heatmap"> = {
    id: "player-skill-xp-heatmap",
    label: "Player × skill XP",
    description: "Experience per clan member across all skills.",
    category: "skills",
    kind: "heatmap",
    card: "chart",
    buildSpec: (ctx) => buildHeatmap(ctx.heatmaps().get("player_skill_xp") ?? [], "XP"),
};

function buildTimeLineSpec(
    points: ReadonlyArray<{ ts: number; v: number }>,
    label: string,
): TimeLineSpec | null {
    if (points.length === 0) return null;
    return {
        data: {
            series: [
                {
                    label,
                    points: points.map((p) => ({ t: p.ts, v: p.v })),
                },
            ],
        },
        window: "7d",
    };
}

const clanXp7d: ChartPreset<"time-line"> = {
    id: "clan-xp-7d",
    label: "Clan XP (7d)",
    description: "Total clan XP gained per hour over the last seven days.",
    category: "skills",
    kind: "time-line",
    card: "chart",
    buildSpec: (ctx) => buildTimeLineSpec(ctx.timeseries().get("clan_xp_7d") ?? [], "XP"),
};

const clanLootValue7d: ChartPreset<"time-line"> = {
    id: "clan-loot-value-7d",
    label: "Clan loot value (7d)",
    description: "Total loot value (gp) per hour over the last seven days.",
    category: "loot",
    kind: "time-line",
    card: "chart",
    buildSpec: (ctx) => buildTimeLineSpec(ctx.timeseries().get("clan_loot_value_7d") ?? [], "gp"),
};

const clanDeaths7d: ChartPreset<"time-line"> = {
    id: "clan-deaths-7d",
    label: "Clan deaths (7d)",
    description: "Death count per hour over the last seven days.",
    category: "combat",
    kind: "time-line",
    card: "chart",
    buildSpec: (ctx) => buildTimeLineSpec(ctx.timeseries().get("clan_deaths_7d") ?? [], "deaths"),
};

export const CHART_PRESETS: ReadonlyArray<ChartPreset> = [
    presetBar(
        "top-bossing-kc",
        "Top bossing KC",
        "Top 10 NPCs by kill count.",
        "highscores",
        "clan.npc_kc.kc.by_source_name.",
        "KC",
    ),
    presetDoughnut(
        "xp-by-skill",
        "XP by skill",
        "Clan XP distribution across all skills.",
        "skills",
        "clan.stats.xp.by_skill.",
        "XP",
    ),
    presetBar(
        "top-skill-levels",
        "Top skill levels",
        "Top 10 skills by aggregate level.",
        "highscores",
        "clan.stats.level.by_skill.",
        "Level",
    ),
    presetBar(
        "top-loot-value-items",
        "Top loot items",
        "Top 10 items by gp value.",
        "loot",
        "clan.loot_drops.unit_price_gp.by_item_name.",
        "gp",
    ),
    presetDoughnut(
        "loot-by-cause",
        "Loot value by cause",
        "Gp value distribution across loot causes.",
        "loot",
        "clan.loot_drops.unit_price_gp.by_cause_name.",
        "gp",
    ),
    presetBar(
        "deaths-by-cause",
        "Deaths by cause",
        "Death counts grouped by cause.",
        "combat",
        "clan.deaths.count.by_cause_name.",
        "deaths",
    ),
    presetDoughnut(
        "clue-tiers",
        "Clue tiers",
        "Completion counts per clue tier.",
        "activity",
        "clan.clues.count.by_tier.",
        "clues",
    ),
    presetBar(
        "combat-achievement-tiers",
        "CA tiers",
        "Completion counts per combat achievement tier.",
        "combat",
        "clan.combat_achievements.count.by_tier.",
        "CAs",
    ),
    presetBar(
        "pet-drops-by-source",
        "Pet drops by source",
        "Pet drop counts per source.",
        "activity",
        "clan.pet_drops.count.by_source_name.",
        "pets",
    ),
    presetDoughnut(
        "diary-tiers",
        "Diary tiers",
        "Diary completions per tier.",
        "activity",
        "clan.diaries.count.by_tier.",
        "diaries",
    ),
    radarSkillsPreset,
    playerBossKcHeatmap,
    playerSkillXpHeatmap,
    clanXp7d,
    clanLootValue7d,
    clanDeaths7d,
];
