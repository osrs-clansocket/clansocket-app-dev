import { clanFlowsDb } from "../../../database/index.js";
import { stepDispatcher } from "./step-dispatcher.js";
import { parseFlowDefinition } from "../../store/parsers/flow-parser.js";
import { BaseDispatcher } from "./base/base-dispatcher.js";
import { registerDispatcher } from "./dispatcher-registry.js";

const LOCK_TTL_MS = 60_000;
const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;
const QUEUE_DEFER_MS = 5_000;

interface LoopRow {
    flow_id: string;
    flow_name: string;
    interval_value: number;
    interval_unit: string;
    jitter_value: number | null;
    jitter_unit: string | null;
    last_fire_at: number | null;
    next_fire_at: number;
    on_overlap: string;
}

function intervalToMs(value: number, unit: string): number {
    switch (unit) {
        case "minutes":
            return value * MINUTE_MS;
        case "hours":
            return value * HOUR_MS;
        case "days":
            return value * DAY_MS;
        case "weeks":
            return value * WEEK_MS;
        default:
            return value * MINUTE_MS;
    }
}

type OverlapPolicy = "skip" | "queue" | "cancel";

function normalizeOverlapPolicy(raw: string): OverlapPolicy {
    if (raw === "queue") return "queue";
    if (raw === "cancel" || raw === "cancel-previous") return "cancel";
    return "skip";
}

class LoopTickDispatcher extends BaseDispatcher {
    public readonly kind = "loop-tick-dispatcher";

    public async sweep(clanId: string, now: number): Promise<readonly string[]> {
        const db = clanFlowsDb(clanId);
        const rows = db
            .prepare(
                "SELECT flow_id, flow_name, interval_value, interval_unit, jitter_value, jitter_unit, last_fire_at, next_fire_at, on_overlap FROM clan_flow_loops WHERE enabled = 1 AND next_fire_at <= ? AND (locked_by IS NULL OR locked_at < ?)",
            )
            .all(now, now - LOCK_TTL_MS) as LoopRow[];
        const fired: string[] = [];
        for (const row of rows) {
            const claimed = this.claim(clanId, row, now);
            if (!claimed) continue;
            const inflight = this.countInflight(clanId, row.flow_id);
            const policy = normalizeOverlapPolicy(row.on_overlap);
            if (inflight > 0 && policy === "skip") {
                this.advance(clanId, row, now);
                continue;
            }
            if (inflight > 0 && policy === "queue") {
                this.deferQueued(clanId, row, now);
                continue;
            }
            if (inflight > 0 && policy === "cancel") {
                this.cancelInflight(clanId, row.flow_id, now);
            }
            await this.fire(clanId, row, now);
            this.advance(clanId, row, now);
            fired.push(row.flow_id);
        }
        return fired;
    }

    private deferQueued(clanId: string, row: LoopRow, now: number): void {
        const db = clanFlowsDb(clanId);
        db.prepare(
            "UPDATE clan_flow_loops SET next_fire_at = ?, locked_by = NULL, locked_at = NULL WHERE flow_id = ?",
        ).run(now + QUEUE_DEFER_MS, row.flow_id);
    }

    private countInflight(clanId: string, flowId: string): number {
        const db = clanFlowsDb(clanId);
        const result = db
            .prepare("SELECT COUNT(*) AS c FROM clan_flow_executions WHERE flow_id = ? AND status IN ('RUNNING', 'WAITING')")
            .get(flowId) as { c: number } | undefined;
        return result?.c ?? 0;
    }

    private cancelInflight(clanId: string, flowId: string, now: number): void {
        const db = clanFlowsDb(clanId);
        db.prepare(
            "UPDATE clan_flow_executions SET status = 'CANCELLED', terminal_at = ?, updated_at = ? WHERE flow_id = ? AND status IN ('RUNNING', 'WAITING')",
        ).run(now, now, flowId);
    }

    private claim(clanId: string, row: LoopRow, now: number): boolean {
        const db = clanFlowsDb(clanId);
        const workerId = `loop-${now}-${row.flow_id}`;
        const result = db
            .prepare(
                "UPDATE clan_flow_loops SET locked_by = ?, locked_at = ? WHERE flow_id = ? AND next_fire_at = ? AND (locked_by IS NULL OR locked_at < ?)",
            )
            .run(workerId, now, row.flow_id, row.next_fire_at, now - LOCK_TTL_MS);
        return result.changes === 1;
    }

    private async fire(clanId: string, row: LoopRow, now: number): Promise<void> {
        const db = clanFlowsDb(clanId);
        const flow = db
            .prepare("SELECT definition_json, published_version FROM clan_flows WHERE flow_id = ?")
            .get(row.flow_id) as { definition_json: string; published_version: number | null } | undefined;
        if (!flow || !flow.published_version) return;
        const definition = parseFlowDefinition(JSON.parse(flow.definition_json));
        await stepDispatcher.advance(
            {
                clanId,
                flowId: row.flow_id,
                flowName: row.flow_name,
                flowVersion: flow.published_version,
                executionId: 0,
                definition,
                event: { kind: "loop.tick", fired_at: now },
                entity: {},
                variables: {},
                trackers: {},
                currentStep: definition.entry_node_id,
                status: "RUNNING",
                exitReason: null,
                failureReason: null,
                wakeEventKind: null,
                wakeAt: null,
                wakeTimeoutAt: null,
            },
            { dryRun: false },
        );
    }

    private advance(clanId: string, row: LoopRow, now: number): void {
        const interval = intervalToMs(row.interval_value, row.interval_unit);
        const nextFireAt = now + interval;
        const db = clanFlowsDb(clanId);
        db.prepare(
            "UPDATE clan_flow_loops SET last_fire_at = ?, next_fire_at = ?, locked_by = NULL, locked_at = NULL WHERE flow_id = ?",
        ).run(now, nextFireAt, row.flow_id);
    }
}

export const loopTickDispatcher = new LoopTickDispatcher();
registerDispatcher(loopTickDispatcher);
