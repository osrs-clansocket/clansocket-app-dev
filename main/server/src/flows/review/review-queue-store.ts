import { clanFlowsDb } from "../../database/index.js";

export interface ReviewQueueEntry {
    readonly id: number;
    readonly flow_id: string;
    readonly flow_name: string;
    readonly execution_id: number;
    readonly action_id: string;
    readonly operation_ref: string | null;
    readonly resolved_inputs_json: string;
    readonly status: "pending" | "approved" | "cancelled";
    readonly submitted_at: number;
    readonly decided_at: number | null;
    readonly decided_by_account_hash: string | null;
    readonly decided_by_rsn: string | null;
    readonly decision_reason: string | null;
}

export function enqueueReview(
    clanId: string,
    args: {
        flowId: string;
        flowName: string;
        executionId: number;
        actionId: string;
        operationRef: string | null;
        resolvedInputs: Readonly<Record<string, unknown>>;
        submittedAt: number;
    },
): number {
    const db = clanFlowsDb(clanId);
    const result = db
        .prepare(
            "INSERT INTO clan_flow_review_queue (flow_id, flow_name, execution_id, action_id, operation_ref, resolved_inputs_json, status, submitted_at) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)",
        )
        .run(
            args.flowId,
            args.flowName,
            args.executionId,
            args.actionId,
            args.operationRef,
            JSON.stringify(args.resolvedInputs),
            args.submittedAt,
        );
    return Number(result.lastInsertRowid);
}

export function listPendingReviews(clanId: string): readonly ReviewQueueEntry[] {
    const db = clanFlowsDb(clanId);
    return db
        .prepare(
            "SELECT id, flow_id, flow_name, execution_id, action_id, operation_ref, resolved_inputs_json, status, submitted_at, decided_at, decided_by_account_hash, decided_by_rsn, decision_reason FROM clan_flow_review_queue WHERE status = 'pending' ORDER BY submitted_at DESC",
        )
        .all() as readonly ReviewQueueEntry[];
}

export function approveReview(
    clanId: string,
    id: number,
    actor: { accountHash: string | null; rsn: string | null; reason: string | null },
    decidedAt: number,
): boolean {
    const db = clanFlowsDb(clanId);
    const result = db
        .prepare(
            "UPDATE clan_flow_review_queue SET status = 'approved', decided_at = ?, decided_by_account_hash = ?, decided_by_rsn = ?, decision_reason = ? WHERE id = ? AND status = 'pending'",
        )
        .run(decidedAt, actor.accountHash, actor.rsn, actor.reason, id);
    return result.changes === 1;
}

export function cancelReview(
    clanId: string,
    id: number,
    actor: { accountHash: string | null; rsn: string | null; reason: string | null },
    decidedAt: number,
): boolean {
    const db = clanFlowsDb(clanId);
    const result = db
        .prepare(
            "UPDATE clan_flow_review_queue SET status = 'cancelled', decided_at = ?, decided_by_account_hash = ?, decided_by_rsn = ?, decision_reason = ? WHERE id = ? AND status = 'pending'",
        )
        .run(decidedAt, actor.accountHash, actor.rsn, actor.reason, id);
    return result.changes === 1;
}
