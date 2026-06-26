import { randomInt } from "node:crypto";
import { clanWomIdentity } from "../../database/wom/identity/get-clan-identity.js";
import { updateBackfillStatus } from "../../database/wom/identity/update-backfill-status.js";
import { MS_PER_DAY, MS_PER_HOUR } from "../../shared/time/index.js";
import { scheduleWake } from "../dispatcher/wake-scheduler.js";
import { safeEnqueueWom } from "./safe-enqueue.js";

const BACKFILL_INTERVAL_MS = MS_PER_DAY;
const SYNC_JITTER_MAX_MS = 300_000;
const STUCK_IN_PROGRESS_THRESHOLD_MS = MS_PER_HOUR;

const REQUEST_KIND_GROUP_DETAILS = "group-details";
const REQUEST_KIND_GROUP_NAME_CHANGES = "group-name-changes";

export type BackfillTriggerResult =
    | { status: "enqueued"; enqueued: number; nextEligibleAt: number; firstAttemptAt: number }
    | { status: "skipped-gate"; nextEligibleAt: number }
    | { status: "skipped-no-identity" };

function isStuckProgress(
    identity: { last_backfill_status: string | null; last_backfill_at: number | null },
    nowMs: number,
): boolean {
    if (identity.last_backfill_status !== "in_progress") return false;
    if (identity.last_backfill_at === null) return true;
    return nowMs - identity.last_backfill_at > STUCK_IN_PROGRESS_THRESHOLD_MS;
}

const requestSpec = (kind: string, path: string, label: string): { kind: string; path: string; label: string } => ({
    kind,
    path,
    label,
});

function enqueueBackfillBatch(clanId: string, groupId: number, firstAttemptAt: number): number {
    const specs = [
        requestSpec(REQUEST_KIND_GROUP_DETAILS, `/groups/${groupId}`, "group-details"),
        requestSpec(REQUEST_KIND_GROUP_NAME_CHANGES, `/groups/${groupId}/name-changes`, "group-name-changes"),
    ];
    let enqueued = 0;
    for (const s of specs) {
        if (
            safeEnqueueWom(
                { clanId, requestKind: s.kind, requestPath: s.path, scheduledAtMs: firstAttemptAt },
                s.label,
                "wom-backfill",
            )
        ) {
            enqueued += 1;
        }
    }
    return enqueued;
}

export function triggerBackfillClan(clanId: string): BackfillTriggerResult {
    const identity = clanWomIdentity(clanId);
    if (!identity) return { status: "skipped-no-identity" };
    const now = Date.now();
    const gated = identity.next_backfill_eligible_at !== null && identity.next_backfill_eligible_at > now;
    if (gated && !isStuckProgress(identity, now)) {
        return { status: "skipped-gate", nextEligibleAt: identity.next_backfill_eligible_at as number };
    }
    const nextEligibleAt = now + BACKFILL_INTERVAL_MS;
    const firstAttemptAt = now + randomInt(0, SYNC_JITTER_MAX_MS);
    const enqueued = enqueueBackfillBatch(clanId, identity.wom_group_id, firstAttemptAt);
    updateBackfillStatus(clanId, "in_progress", nextEligibleAt);
    scheduleWake(clanId, firstAttemptAt);
    return { status: "enqueued", enqueued, nextEligibleAt, firstAttemptAt };
}
