import { clanFlowsDb } from "../../../database/index.js";
import { stepDispatcher } from "./step-dispatcher.js";
import { parseFlowDefinition } from "../../store/parsers/flow-parser.js";
import { BaseDispatcher } from "./base/base-dispatcher.js";
import { registerDispatcher } from "./dispatcher-registry.js";

const LOCK_TTL_MS = 60_000;

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
        computeNextFireAt: (cron: string, after: number, timezone: string) => number,
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
            await this.fire(clanId, row, now);
            const nextFireAt = computeNextFireAt(row.cron_expression, now, row.timezone);
            this.advance(clanId, row, now, nextFireAt);
            fired.push(row.flow_id);
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
