import { clanFlowsDb } from "../../database/index.js";
import { SQL_TABLES } from "../../database/core/sql-columns.js";
import { defineTopic } from "./subscriber-projection.js";
import type { ProjectionTopic } from "./projection-types.js";
import { scopeKeyClan } from "./writes-stream.js";

interface FlowListRow {
    flow_id: string;
    flow_name: string;
    enabled: number;
    archived: number;
    published_version: number | null;
    created_at: number;
    updated_at: number;
}

const LIST_SQL =
    "SELECT flow_id, flow_name, enabled, archived, published_version, created_at, updated_at FROM clan_flows ORDER BY updated_at DESC";

function listFlowsForTopic(clanId: string): Record<string, unknown>[] {
    try {
        const rows = clanFlowsDb(clanId).prepare(LIST_SQL).all() as FlowListRow[];
        return rows as unknown as Record<string, unknown>[];
    } catch {
        return [];
    }
}

export function flowsTopic(clanId: string): ProjectionTopic {
    return defineTopic({
        triggers: [{ scopeKey: scopeKeyClan(clanId), table: SQL_TABLES.CLAN_FLOWS }],
        query: () => listFlowsForTopic(clanId),
        keyOf: (row) => String(row.flow_id),
    });
}
