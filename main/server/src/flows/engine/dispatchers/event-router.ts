import logger from "@clansocket/logger";
import { clanFlowsDb } from "../../../database/index.js";
import { parseFlowDefinition } from "../../store/parsers/flow-parser.js";
import { stepDispatcher } from "./step-dispatcher.js";
import type { ExecContext } from "../context/exec-context.js";
import type { FlowDefinition } from "../../store/flow-definition-types.js";

interface FlowRow {
    flow_id: string;
    flow_name: string;
    definition_json: string;
    published_version: number | null;
}

interface VersionRow {
    definition_json: string;
}

const SELECT_ENABLED_FLOWS_SQL =
    "SELECT flow_id, flow_name, definition_json, published_version FROM clan_flows WHERE enabled = 1 AND archived = 0";

const SELECT_VERSION_SQL =
    "SELECT definition_json FROM clan_flow_versions WHERE flow_id = ? AND version = ?";

export interface FlowEventInput {
    readonly clanId: string;
    readonly triggerId: string;
    readonly rsn: string | null;
    readonly payload: Readonly<Record<string, unknown>>;
}

function loadFlowDefinition(clanId: string, row: FlowRow): FlowDefinition | null {
    try {
        const sourceJson = row.published_version !== null
            ? loadPublishedVersion(clanId, row.flow_id, row.published_version) ?? row.definition_json
            : row.definition_json;
        return parseFlowDefinition(JSON.parse(sourceJson));
    } catch (err) {
        logger.warn(`flow event-router: parse failed for ${row.flow_id}: ${(err as Error).message}`);
        return null;
    }
}

function loadPublishedVersion(clanId: string, flowId: string, version: number): string | null {
    const row = clanFlowsDb(clanId).prepare(SELECT_VERSION_SQL).get(flowId, version) as VersionRow | undefined;
    return row?.definition_json ?? null;
}

function flowMatchesTrigger(definition: FlowDefinition, triggerId: string): boolean {
    if (definition.trigger_type !== "event") return false;
    return definition.trigger_config.event_source === triggerId;
}

function buildExecutionId(): number {
    return 0;
}

function buildExecContext(row: FlowRow, definition: FlowDefinition, input: FlowEventInput): ExecContext {
    return {
        clanId: input.clanId,
        flowId: row.flow_id,
        flowName: row.flow_name,
        flowVersion: row.published_version ?? 0,
        executionId: buildExecutionId(),
        definition,
        event: input.payload,
        entity: input.rsn ? { rsn: input.rsn } : {},
        variables: {},
        trackers: {},
        currentStep: definition.entry_node_id,
        status: "RUNNING",
        exitReason: null,
        failureReason: null,
    };
}

async function runFlowForEvent(row: FlowRow, input: FlowEventInput): Promise<void> {
    const definition = loadFlowDefinition(input.clanId, row);
    if (!definition) return;
    if (!flowMatchesTrigger(definition, input.triggerId)) return;
    const ctx = buildExecContext(row, definition, input);
    try {
        await stepDispatcher.advance(ctx);
    } catch (err) {
        logger.warn(`flow event-router: execution failed for ${row.flow_id}: ${(err as Error).message}`);
    }
}

export async function dispatchEventToFlows(input: FlowEventInput): Promise<void> {
    let rows: FlowRow[] = [];
    try {
        rows = clanFlowsDb(input.clanId).prepare(SELECT_ENABLED_FLOWS_SQL).all() as FlowRow[];
    } catch (err) {
        logger.warn(`flow event-router: db read failed for clan ${input.clanId}: ${(err as Error).message}`);
        return;
    }
    for (const row of rows) {
        await runFlowForEvent(row, input);
    }
}

export function dispatchEventSafe(input: FlowEventInput): void {
    void dispatchEventToFlows(input).catch((err) => {
        logger.warn(`flow event-router top-level failure: ${(err as Error).message}`);
    });
}
