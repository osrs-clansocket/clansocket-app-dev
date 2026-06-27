import { listTriggers, runAllMetrics } from "../../../clans/homepage/metrics-registry.js";
import { defineTopic } from "../subscriber-projection.js";
import { scopeKeyPlugin } from "../writes-stream.js";
import type { ProjectionTopic } from "../projection-types.js";

export function metricsTopic(clanId: string): ProjectionTopic {
    const triggers = listTriggers(clanId).map((t) => ({ scopeKey: scopeKeyPlugin(clanId, t.mode), table: t.table }));
    return defineTopic({
        triggers,
        query: () => runAllMetrics(clanId) as unknown as Record<string, unknown>[],
        keyOf: (row) => String(row.variable_key),
    });
}
