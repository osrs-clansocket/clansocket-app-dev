import { clanFlowsDb } from "../../../database/index.js";
import { stepDispatcher } from "./step-dispatcher.js";
import { parseFlowDefinition } from "../../store/parsers/flow-parser.js";
import { BaseDispatcher } from "./base/base-dispatcher.js";
import { registerDispatcher } from "./dispatcher-registry.js";
import { claimCustomIdempotency } from "../store/idempotency-store.js";

const LOCK_TTL_MS = 60_000;
const DST_FIRE_KEY_RETENTION_MS = 90 * 60_000;

function localFireKey(flowId: string, fireMs: number, timezone: string | null): string {
    if (!timezone || timezone.length === 0) {
        const d = new Date(fireMs);
        return `cron-fire:${flowId}:${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}:${d.getUTCHours()}:${d.getUTCMinutes()}`;
    }
    const fmt = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    });
    const parts = fmt.formatToParts(new Date(fireMs));
    const lookup: Record<string, string> = {};
    for (const p of parts) lookup[p.type] = p.value;
    return `cron-fire:${flowId}:${lookup.year}-${lookup.month}-${lookup.day}:${lookup.hour}:${lookup.minute}`;
}

interface ScheduleRow {
    flow_id: string;
    flow_name: string;
    cron_expression: string;
    timezone: string;
    last_fire_at: number | null;
    next_fire_at: number;
}

class ScheduleTickDispatcher extends BaseDispatcher {
    public readonly kind = "schedule-tick-dispatcher";

    public async sweep(
        clanId: string,
        now: number,
        computeNextFireAt: (cron: string, after: number, timezone: string | null) => number,
    ): Promise<readonly string[]> {
        const db = clanFlowsDb(clanId);
        const rows = db
            .prepare(
                "SELECT flow_id, flow_name, cron_expression, timezone, last_fire_at, next_fire_at FROM clan_flow_schedules WHERE enabled = 1 AND next_fire_at <= ? AND (locked_by IS NULL OR locked_at < ?)",
            )
            .all(now, now - LOCK_TTL_MS) as ScheduleRow[];
        const fired: string[] = [];
        for (const row of rows) {
            const claimed = this.claim(clanId, row, now);
            if (!claimed) continue;
            const dstKey = localFireKey(row.flow_id, row.next_fire_at, row.timezone);
            if (claimCustomIdempotency(clanId, dstKey, DST_FIRE_KEY_RETENTION_MS)) {
                await this.fire(clanId, row, now);
                fired.push(row.flow_id);
            }
            const nextFireAt = computeNextFireAt(row.cron_expression, now, row.timezone);
            this.advance(clanId, row, now, nextFireAt);
        }
        return fired;
    }

    private claim(clanId: string, row: ScheduleRow, now: number): boolean {
        const db = clanFlowsDb(clanId);
        const workerId = `schedule-${now}-${row.flow_id}`;
        const result = db
            .prepare(
                "UPDATE clan_flow_schedules SET locked_by = ?, locked_at = ? WHERE flow_id = ? AND next_fire_at = ? AND (locked_by IS NULL OR locked_at < ?)",
            )
            .run(workerId, now, row.flow_id, row.next_fire_at, now - LOCK_TTL_MS);
        return result.changes === 1;
    }

    private async fire(clanId: string, row: ScheduleRow, now: number): Promise<void> {
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
                event: { kind: "schedule.tick", fired_at: now, cron: row.cron_expression },
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

    private advance(clanId: string, row: ScheduleRow, now: number, nextFireAt: number): void {
        const db = clanFlowsDb(clanId);
        db.prepare(
            "UPDATE clan_flow_schedules SET last_fire_at = ?, next_fire_at = ?, locked_by = NULL, locked_at = NULL WHERE flow_id = ?",
        ).run(now, nextFireAt, row.flow_id);
    }
}

export const scheduleTickDispatcher = new ScheduleTickDispatcher();
registerDispatcher(scheduleTickDispatcher);
