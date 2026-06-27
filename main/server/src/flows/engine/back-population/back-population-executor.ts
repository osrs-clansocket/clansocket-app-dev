import { clanFlowsDb } from "../../../database/index.js";
import { parseFlowDefinition } from "../../store/parsers/flow-parser.js";
import { stepDispatcher } from "../dispatchers/step-dispatcher.js";

export interface BackPopulationEvent {
    readonly account_hash: string | null;
    readonly rsn: string | null;
    readonly payload: Readonly<Record<string, unknown>>;
    readonly received_at: number;
}

export interface BackPopulationResult {
    readonly enrolled: number;
    readonly skipped: number;
}

export async function backPopulateOnFirstPublish(
    clanId: string,
    flowId: string,
    historicalEvents: readonly BackPopulationEvent[],
): Promise<BackPopulationResult> {
    const db = clanFlowsDb(clanId);
    const row = db
        .prepare(
            "SELECT flow_id, flow_name, definition_json, published_version FROM clan_flows WHERE flow_id = ?",
        )
        .get(flowId) as { flow_id: string; flow_name: string; definition_json: string; published_version: number | null } | undefined;
    if (!row || !row.published_version) return { enrolled: 0, skipped: historicalEvents.length };
    const definition = parseFlowDefinition(JSON.parse(row.definition_json));
    if (!definition.backpopulate_on_first_publish) return { enrolled: 0, skipped: historicalEvents.length };
    const lookback = definition.backpopulate_lookback_ms ?? 0;
    if (lookback <= 0) return { enrolled: 0, skipped: historicalEvents.length };
    const now = 0;
    const cutoff = now - lookback;
    let enrolled = 0;
    let skipped = 0;
    for (const event of historicalEvents) {
        if (event.received_at < cutoff) {
            skipped += 1;
            continue;
        }
        await stepDispatcher.advance(
            {
                clanId,
                flowId: row.flow_id,
                flowName: row.flow_name,
                flowVersion: row.published_version,
                executionId: 0,
                definition,
                event: event.payload,
                entity: { rsn: event.rsn, account_hash: event.account_hash },
                variables: {},
                trackers: {},
                currentStep: definition.entry_node_id,
                status: "RUNNING",
                exitReason: null,
                failureReason: null,
            },
            { dryRun: false },
        );
        enrolled += 1;
    }
    return { enrolled, skipped };
}
