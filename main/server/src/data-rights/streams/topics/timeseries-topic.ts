import { clanPluginDb, pluginModes } from "../../../database/core/clans.js";
import { TIMESERIES_SPECS, type TimeseriesSpec } from "../../../clans/homepage/timeseries-specs.js";
import { defineTopic } from "../subscriber-projection.js";
import { scopeKeyPlugin } from "../writes-stream.js";
import type { ProjectionTopic } from "../projection-types.js";

interface PointRow {
    readonly variable_key: string;
    readonly ts: number;
    readonly v: number;
}

function runSeries(clanId: string, mode: string, spec: TimeseriesSpec, now: number, out: PointRow[]): void {
    const db = clanPluginDb(clanId, mode);
    const since = now - spec.windowMs;
    const sql = `SELECT (${spec.timeCol} / ${spec.bucketMs}) * ${spec.bucketMs} AS bucket_ts, SUM(${spec.valueExpr}) AS v FROM ${spec.table} WHERE ${spec.timeCol} > ? GROUP BY bucket_ts ORDER BY bucket_ts`;
    const rows = db.prepare(sql).all(since) as { bucket_ts: number | null; v: number | null }[];
    for (const r of rows) {
        if (r.bucket_ts === null) continue;
        const ts = Number(r.bucket_ts);
        out.push({
            variable_key: `clan.timeseries.${spec.key}.${ts}`,
            ts,
            v: Number(r.v ?? 0),
        });
    }
}

function runAllTimeseries(clanId: string): PointRow[] {
    const now = Date.now();
    const out: PointRow[] = [];
    for (const mode of pluginModes(clanId)) {
        for (const spec of TIMESERIES_SPECS) runSeries(clanId, mode, spec, now, out);
    }
    return out;
}

function listTriggers(clanId: string): Array<{ scopeKey: string; table: string }> {
    const out: Array<{ scopeKey: string; table: string }> = [];
    const seen = new Set<string>();
    for (const mode of pluginModes(clanId)) {
        const scopeKey = scopeKeyPlugin(clanId, mode);
        for (const spec of TIMESERIES_SPECS) {
            const k = `${scopeKey}|${spec.table}`;
            if (seen.has(k)) continue;
            seen.add(k);
            out.push({ scopeKey, table: spec.table });
        }
    }
    return out;
}

export function timeseriesTopic(clanId: string): ProjectionTopic {
    return defineTopic({
        triggers: listTriggers(clanId),
        query: () => runAllTimeseries(clanId) as unknown as Record<string, unknown>[],
        keyOf: (row) => String(row.variable_key),
    });
}
