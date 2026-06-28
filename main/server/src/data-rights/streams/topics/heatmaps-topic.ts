import { clanPluginDb, pluginModes } from "../../../database/core/clans.js";
import { HEATMAP_SPECS, type HeatmapSpec } from "../../../clans/homepage/heatmap-specs.js";
import { defineTopic } from "../subscriber-projection.js";
import { scopeKeyPlugin } from "../writes-stream.js";
import type { ProjectionTopic } from "../projection-types.js";

interface CellRow {
    readonly variable_key: string;
    readonly x: string;
    readonly y: string;
    readonly v: number;
}

function topColumns(db: ReturnType<typeof clanPluginDb>, spec: HeatmapSpec): string[] {
    const sql = `SELECT ${spec.colCol} AS c FROM ${spec.table} GROUP BY ${spec.colCol} ORDER BY ${spec.valueAgg}(${spec.valueExpr}) DESC LIMIT ?`;
    const rows = db.prepare(sql).all(spec.topNCols) as { c: string | null }[];
    return rows.map((r) => String(r.c ?? "")).filter((c) => c.length > 0);
}

function runHeatmap(clanId: string, mode: string, spec: HeatmapSpec, out: CellRow[]): void {
    const db = clanPluginDb(clanId, mode);
    const cols = topColumns(db, spec);
    if (cols.length === 0) return;
    const placeholders = cols.map(() => "?").join(",");
    const sql = `SELECT ${spec.rowCol} AS x, ${spec.colCol} AS y, ${spec.valueAgg}(${spec.valueExpr}) AS v FROM ${spec.table} WHERE ${spec.colCol} IN (${placeholders}) GROUP BY ${spec.rowCol}, ${spec.colCol}`;
    const rows = db.prepare(sql).all(...cols) as { x: string | null; y: string | null; v: number | null }[];
    for (const r of rows) {
        if (r.x === null || r.y === null) continue;
        const x = String(r.x);
        const y = String(r.y);
        out.push({
            variable_key: `clan.heatmap.${spec.key}.${x}.${y}`,
            x,
            y,
            v: Number(r.v ?? 0),
        });
    }
}

function runAllHeatmaps(clanId: string): CellRow[] {
    const out: CellRow[] = [];
    for (const mode of pluginModes(clanId)) {
        for (const spec of HEATMAP_SPECS) runHeatmap(clanId, mode, spec, out);
    }
    return out;
}

function listTriggers(clanId: string): Array<{ scopeKey: string; table: string }> {
    const out: Array<{ scopeKey: string; table: string }> = [];
    const seen = new Set<string>();
    for (const mode of pluginModes(clanId)) {
        const scopeKey = scopeKeyPlugin(clanId, mode);
        for (const spec of HEATMAP_SPECS) {
            const k = `${scopeKey}|${spec.table}`;
            if (seen.has(k)) continue;
            seen.add(k);
            out.push({ scopeKey, table: spec.table });
        }
    }
    return out;
}

export function heatmapsTopic(clanId: string): ProjectionTopic {
    return defineTopic({
        triggers: listTriggers(clanId),
        query: () => runAllHeatmaps(clanId) as unknown as Record<string, unknown>[],
        keyOf: (row) => String(row.variable_key),
    });
}
