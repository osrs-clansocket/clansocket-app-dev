import type Database from "better-sqlite3";
import { clanPluginDb, pluginModes } from "../../database/core/clans.js";
import { pragmaTableInfo } from "../../database/core/migrator/migration-guards.js";
import { EXCLUDED_TABLES, GROUP_COL_PATTERNS, METRIC_COL_RULES, type MetricColRule } from "./metric-rules.js";
import type { MetricRow } from "./metric-types.js";
import { disambiguate, shortTableName, slugify } from "./metrics-slug.js";

interface TableScan {
    readonly mode: string;
    readonly table: string;
    readonly short: string;
    readonly cols: ReadonlySet<string>;
    readonly metricCols: readonly string[];
    readonly groupCols: readonly string[];
    readonly hasAccountHash: boolean;
}

interface PluginScope {
    readonly clanId: string;
    readonly multiMode: boolean;
}

const scanCache = new Map<string, TableScan[]>();

function listPluginTables(db: Database.Database): string[] {
    const rows = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE 'plugin_%'").all() as {
        name: string;
    }[];
    return rows.map((r) => r.name).filter((name) => !EXCLUDED_TABLES.has(name) && !name.endsWith("_changes"));
}

function scanTable(db: Database.Database, mode: string, table: string): TableScan {
    const info = pragmaTableInfo(db, table);
    const cols = new Set(info.map((c) => c.name));
    const metricCols = Object.entries(METRIC_COL_RULES)
        .filter(([col, rule]) => cols.has(col) && (!rule.requires || cols.has(rule.requires)))
        .map(([col]) => col);
    const groupCols = [...GROUP_COL_PATTERNS].filter((col) => cols.has(col));
    return {
        mode,
        table,
        short: shortTableName(table),
        cols,
        metricCols,
        groupCols,
        hasAccountHash: cols.has("account_hash"),
    };
}

function scanMode(clanId: string, mode: string): TableScan[] {
    const key = `${clanId}:${mode}`;
    const cached = scanCache.get(key);
    if (cached !== undefined) return cached;
    const db = clanPluginDb(clanId, mode);
    const scans = listPluginTables(db).map((t) => scanTable(db, mode, t));
    scanCache.set(key, scans);
    return scans;
}

function modePrefix(mode: string, scope: PluginScope): string {
    return scope.multiMode ? `${mode}.` : "";
}

function totalKey(scope: PluginScope, mode: string, short: string, col: string): string {
    return `clan.${modePrefix(mode, scope)}${short}.${col}.total`;
}

function groupKey(
    scope: PluginScope,
    mode: string,
    short: string,
    col: string,
    groupCol: string,
    slug: string,
): string {
    return `clan.${modePrefix(mode, scope)}${short}.${col}.by_${groupCol}.${slug}`;
}

function countKey(scope: PluginScope, mode: string, short: string): string {
    return `clan.${modePrefix(mode, scope)}${short}.count`;
}

function membersKey(scope: PluginScope, mode: string, short: string): string {
    return `clan.${modePrefix(mode, scope)}${short}.active_members`;
}

function totalExpr(col: string, rule: MetricColRule): string {
    return `${rule.agg}(${rule.expr ?? col})`;
}

function emitTotal(
    out: MetricRow[],
    scope: PluginScope,
    scan: TableScan,
    db: Database.Database,
    col: string,
    rule: MetricColRule,
): void {
    const row = db.prepare(`SELECT ${totalExpr(col, rule)} AS v FROM ${scan.table}`).get() as { v: number | null };
    out.push({
        variable_key: totalKey(scope, scan.mode, scan.short, col),
        value: Number(row?.v ?? 0),
        format: rule.format,
        label: `${scan.short.replace(/_/g, " ")} total ${rule.label}`,
        category: rule.category,
    });
}

function emitGroup(
    out: MetricRow[],
    scope: PluginScope,
    scan: TableScan,
    db: Database.Database,
    col: string,
    rule: MetricColRule,
    groupCol: string,
): void {
    const rows = db
        .prepare(`SELECT ${groupCol} AS g, ${totalExpr(col, rule)} AS v FROM ${scan.table} GROUP BY ${groupCol}`)
        .all() as { g: string | null; v: number | null }[];
    const seen = new Set<string>();
    for (const r of rows) {
        if (r.g === null || r.g === "") continue;
        const slug = disambiguate(slugify(String(r.g)), seen);
        if (slug === "") continue;
        out.push({
            variable_key: groupKey(scope, scan.mode, scan.short, col, groupCol, slug),
            value: Number(r.v ?? 0),
            format: rule.format,
            label: `${scan.short.replace(/_/g, " ")} ${rule.label} — ${String(r.g)}`,
            category: rule.category,
        });
    }
}

function emitCount(out: MetricRow[], scope: PluginScope, scan: TableScan, db: Database.Database): void {
    const row = db.prepare(`SELECT COUNT(*) AS v FROM ${scan.table}`).get() as { v: number | null };
    out.push({
        variable_key: countKey(scope, scan.mode, scan.short),
        value: Number(row?.v ?? 0),
        format: "int",
        label: `${scan.short.replace(/_/g, " ")} count`,
        category: "activity",
    });
}

function emitCountByGroup(
    out: MetricRow[],
    scope: PluginScope,
    scan: TableScan,
    db: Database.Database,
    groupCol: string,
): void {
    const rows = db.prepare(`SELECT ${groupCol} AS g, COUNT(*) AS v FROM ${scan.table} GROUP BY ${groupCol}`).all() as {
        g: string | null;
        v: number | null;
    }[];
    const seen = new Set<string>();
    for (const r of rows) {
        if (r.g === null || r.g === "") continue;
        const slug = disambiguate(slugify(String(r.g)), seen);
        if (slug === "") continue;
        out.push({
            variable_key: groupKey(scope, scan.mode, scan.short, "count", groupCol, slug),
            value: Number(r.v ?? 0),
            format: "int",
            label: `${scan.short.replace(/_/g, " ")} count — ${String(r.g)}`,
            category: "activity",
        });
    }
}

function emitMembers(out: MetricRow[], scope: PluginScope, scan: TableScan, db: Database.Database): void {
    const row = db.prepare(`SELECT COUNT(DISTINCT account_hash) AS v FROM ${scan.table}`).get() as { v: number | null };
    out.push({
        variable_key: membersKey(scope, scan.mode, scan.short),
        value: Number(row?.v ?? 0),
        format: "int",
        label: `${scan.short.replace(/_/g, " ")} active members`,
        category: "activity",
    });
}

function emitScan(out: MetricRow[], scope: PluginScope, scan: TableScan): void {
    const db = clanPluginDb(scope.clanId, scan.mode);
    if (scan.metricCols.length === 0) {
        emitCount(out, scope, scan, db);
        for (const groupCol of scan.groupCols) emitCountByGroup(out, scope, scan, db, groupCol);
    } else {
        for (const col of scan.metricCols) {
            const rule = METRIC_COL_RULES[col];
            if (rule === undefined) continue;
            emitTotal(out, scope, scan, db, col, rule);
            for (const groupCol of scan.groupCols) emitGroup(out, scope, scan, db, col, rule, groupCol);
        }
    }
    if (scan.hasAccountHash) emitMembers(out, scope, scan, db);
}

export function listClanScans(clanId: string): TableScan[] {
    const modes = pluginModes(clanId);
    return modes.flatMap((mode) => scanMode(clanId, mode));
}

export function runAllMetrics(clanId: string): MetricRow[] {
    const modes = pluginModes(clanId);
    const scope: PluginScope = { clanId, multiMode: modes.length > 1 };
    const out: MetricRow[] = [];
    for (const mode of modes) {
        for (const scan of scanMode(clanId, mode)) emitScan(out, scope, scan);
    }
    return out;
}

export function listTriggers(clanId: string): Array<{ mode: string; table: string }> {
    return listClanScans(clanId).map((s) => ({ mode: s.mode, table: s.table }));
}
