import { clanFlowsDb } from "../../../database/index.js";
import type { RuntimeHoldOverlay } from "./hold-types.js";

export function readHold(clanId: string, flowId: string, actionId: string, now: number): RuntimeHoldOverlay | null {
    const db = clanFlowsDb(clanId);
    const row = db
        .prepare(
            "SELECT flow_id, flow_name, action_id, hold_status, set_by_account_hash, set_by_rsn, set_at, expires_at, reason FROM clan_flow_runtime_holds WHERE flow_id = ? AND action_id = ?",
        )
        .get(flowId, actionId) as RuntimeHoldOverlay | undefined;
    if (!row) return null;
    if (row.expires_at !== null && row.expires_at <= now) return null;
    return row;
}

export function setHold(
    clanId: string,
    flowId: string,
    flowName: string,
    actionId: string,
    overlay: { hold_status: RuntimeHoldOverlay["hold_status"]; reason: string | null; expires_at: number | null; set_by_account_hash: string | null; set_by_rsn: string | null },
    now: number,
): void {
    const db = clanFlowsDb(clanId);
    db.prepare(
        "INSERT OR REPLACE INTO clan_flow_runtime_holds (flow_id, flow_name, action_id, hold_status, set_by_account_hash, set_by_rsn, set_at, expires_at, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ).run(
        flowId,
        flowName,
        actionId,
        overlay.hold_status,
        overlay.set_by_account_hash,
        overlay.set_by_rsn,
        now,
        overlay.expires_at,
        overlay.reason,
    );
}

export function releaseHold(clanId: string, flowId: string, actionId: string): void {
    const db = clanFlowsDb(clanId);
    db.prepare("DELETE FROM clan_flow_runtime_holds WHERE flow_id = ? AND action_id = ?").run(flowId, actionId);
}
