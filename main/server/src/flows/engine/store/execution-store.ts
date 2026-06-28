import { clanFlowsDb } from "../../../database/index.js";
import { parseFlowDefinition } from "../../store/parsers/flow-parser.js";
import type { ExecContext } from "../context/exec-context.js";

const INSERT_SQL = `INSERT INTO clan_flow_executions (
    flow_id, flow_name, flow_version, account_hash, rsn, status, current_step, context_json,
    entered_at, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

const UPDATE_SQL = `UPDATE clan_flow_executions
    SET status = ?, current_step = ?, context_json = ?, updated_at = ?, terminal_at = ?, exit_reason = ?,
        failure_reason = ?, wake_event_kind = ?, wake_at = ?, wake_timeout_at = ?
    WHERE id = ?`;

function serializeContext(ctx: ExecContext): string {
    return JSON.stringify({
        event: ctx.event,
        entity: ctx.entity,
        variables: ctx.variables,
        trackers: ctx.trackers,
        botId: ctx.botId,
        guildId: ctx.guildId,
    });
}

function isTerminal(status: string): boolean {
    return status === "COMPLETED" || status === "EXITED" || status === "FAILED" || status === "CANCELLED";
}

export function insertExecution(ctx: ExecContext): number {
    const now = Date.now();
    const accountHash = typeof ctx.entity.account_hash === "string" ? ctx.entity.account_hash : null;
    const rsn = typeof ctx.entity.rsn === "string" ? ctx.entity.rsn : null;
    const result = clanFlowsDb(ctx.clanId)
        .prepare(INSERT_SQL)
        .run(
            ctx.flowId,
            ctx.flowName,
            ctx.flowVersion,
            accountHash,
            rsn,
            ctx.status,
            ctx.currentStep,
            serializeContext(ctx),
            now,
            now,
        );
    return Number(result.lastInsertRowid);
}

export function updateExecution(ctx: ExecContext, executionId: number): void {
    const now = Date.now();
    const terminal = isTerminal(ctx.status) ? now : null;
    clanFlowsDb(ctx.clanId)
        .prepare(UPDATE_SQL)
        .run(
            ctx.status,
            ctx.currentStep,
            serializeContext(ctx),
            now,
            terminal,
            ctx.exitReason,
            ctx.failureReason,
            ctx.wakeEventKind,
            ctx.wakeAt,
            ctx.wakeTimeoutAt,
            executionId,
        );
}

interface ExecutionRow {
    id: number;
    flow_id: string;
    flow_name: string;
    flow_version: number;
    status: string;
    current_step: string;
    context_json: string;
    wake_event_kind: string | null;
    wake_at: number | null;
    wake_timeout_at: number | null;
}

const SELECT_WAITING_TIME_SQL = `SELECT id, flow_id, flow_name, flow_version, status, current_step, context_json,
    wake_event_kind, wake_at, wake_timeout_at FROM clan_flow_executions
    WHERE status = 'WAITING' AND wake_at IS NOT NULL AND wake_at <= ?`;

const SELECT_WAITING_EVENT_SQL = `SELECT id, flow_id, flow_name, flow_version, status, current_step, context_json,
    wake_event_kind, wake_at, wake_timeout_at FROM clan_flow_executions
    WHERE status = 'WAITING' AND wake_event_kind = ?`;

const SELECT_FLOW_DEFINITION_SQL = `SELECT definition_json FROM clan_flows WHERE flow_id = ?`;
const SELECT_FLOW_VERSION_SQL = `SELECT definition_json FROM clan_flow_versions WHERE flow_id = ? AND version = ?`;

export interface WaitingExecution {
    readonly executionId: number;
    readonly ctx: ExecContext;
}

function loadDefinitionForRow(
    clanId: string,
    row: ExecutionRow,
): import("../../store/flow-definition-types.js").FlowDefinition | null {
    try {
        const versionRow = clanFlowsDb(clanId).prepare(SELECT_FLOW_VERSION_SQL).get(row.flow_id, row.flow_version) as
            | { definition_json: string }
            | undefined;
        const json =
            versionRow?.definition_json ??
            (
                clanFlowsDb(clanId).prepare(SELECT_FLOW_DEFINITION_SQL).get(row.flow_id) as
                    | { definition_json: string }
                    | undefined
            )?.definition_json;
        if (!json) return null;
        return parseFlowDefinition(JSON.parse(json));
    } catch {
        return null;
    }
}

function reviveContext(clanId: string, row: ExecutionRow): WaitingExecution | null {
    const definition = loadDefinitionForRow(clanId, row);
    if (!definition) return null;
    const context = JSON.parse(row.context_json) as Record<string, unknown>;
    return {
        executionId: row.id,
        ctx: {
            clanId,
            flowId: row.flow_id,
            flowName: row.flow_name,
            flowVersion: row.flow_version,
            executionId: row.id,
            definition,
            event: (context.event as Record<string, unknown>) ?? {},
            entity: (context.entity as Record<string, unknown>) ?? {},
            variables: (context.variables as Record<string, unknown>) ?? {},
            trackers: (context.trackers as Record<string, unknown>) ?? {},
            currentStep: row.current_step,
            status: "RUNNING",
            exitReason: null,
            failureReason: null,
            wakeEventKind: null,
            wakeAt: null,
            wakeTimeoutAt: null,
            botId: typeof context.botId === "string" ? context.botId : undefined,
            guildId: typeof context.guildId === "string" ? context.guildId : undefined,
        },
    };
}

export function listWaitingByWakeTime(clanId: string, now: number): readonly WaitingExecution[] {
    const rows = clanFlowsDb(clanId).prepare(SELECT_WAITING_TIME_SQL).all(now) as ExecutionRow[];
    const out: WaitingExecution[] = [];
    for (const row of rows) {
        const revived = reviveContext(clanId, row);
        if (revived) out.push(revived);
    }
    return out;
}

export function listWaitingByEvent(clanId: string, eventKind: string): readonly WaitingExecution[] {
    const rows = clanFlowsDb(clanId).prepare(SELECT_WAITING_EVENT_SQL).all(eventKind) as ExecutionRow[];
    const out: WaitingExecution[] = [];
    for (const row of rows) {
        const revived = reviveContext(clanId, row);
        if (revived) out.push(revived);
    }
    return out;
}

const CLAIM_WAITING_TIME_SQL = `UPDATE clan_flow_executions
    SET status = 'RUNNING', updated_at = ?, wake_at = NULL
    WHERE id = ? AND status = 'WAITING' AND wake_at IS NOT NULL AND wake_at <= ?`;

const CLAIM_WAITING_EVENT_SQL = `UPDATE clan_flow_executions
    SET status = 'RUNNING', updated_at = ?, wake_event_kind = NULL, wake_at = NULL, wake_timeout_at = NULL
    WHERE id = ? AND status = 'WAITING' AND wake_event_kind = ?`;

export function claimWaitingByTime(clanId: string, executionId: number, now: number): boolean {
    const result = clanFlowsDb(clanId).prepare(CLAIM_WAITING_TIME_SQL).run(now, executionId, now);
    return result.changes === 1;
}

export function claimWaitingByEvent(clanId: string, executionId: number, eventKind: string, now: number): boolean {
    const result = clanFlowsDb(clanId).prepare(CLAIM_WAITING_EVENT_SQL).run(now, executionId, eventKind);
    return result.changes === 1;
}
