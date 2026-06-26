import logger from "@clansocket/logger";
import { getPlayerFreshness } from "../../database/wom/freshness/get-freshness.js";
import { hashByRsn } from "../../database/wom/saturate/resolve-account-hash.js";
import { parseIsoMs } from "../../shared/time/index.js";
import { isNonBlank } from "../../shared/validators/type-guards.js";
import { safeEnqueueWom } from "./safe-enqueue.js";
import { SNAPSHOT_COUNTERS, type SnapshotOutcome } from "./snapshot-outcome.js";
import type { SnapshotPlanResult } from "./snapshot-plan-types.js";

export type { SnapshotPlanResult } from "./snapshot-plan-types.js";

const REQUEST_KIND_PLAYER_SNAPSHOT = "player-snapshot";

interface GroupDetailsPlayer {
    id?: number;
    username?: string;
    displayName?: string;
    updatedAt?: string;
    lastChangedAt?: string | null;
}

interface GroupDetailsMembership {
    player?: GroupDetailsPlayer;
}

interface GroupDetailsLike {
    memberships?: GroupDetailsMembership[];
}

interface PlanSnapshotArgs {
    clanId: string;
    womGroupId: number;
    rsn: string;
    womChangedAtMs: number;
    now: number;
}

function planSnapshotMember(args: PlanSnapshotArgs): SnapshotOutcome {
    const { clanId, womGroupId, rsn, womChangedAtMs, now } = args;
    const accountHash = hashByRsn(clanId, womGroupId, rsn);
    const freshness = getPlayerFreshness(clanId, accountHash);
    if (freshness !== null && womChangedAtMs > 0 && womChangedAtMs <= freshness.last_wom_updated_at) {
        return "skipped_fresh";
    }
    const enqueued = safeEnqueueWom(
        {
            clanId,
            requestKind: REQUEST_KIND_PLAYER_SNAPSHOT,
            requestPath: `/players/${encodeURIComponent(rsn)}`,
            scheduledAtMs: now,
        },
        `player-snapshot rsn=${rsn}`,
        "wom-snapshot-planner",
    );
    return enqueued ? "enqueued" : "failed";
}

export function planSnapshots(clanId: string, womGroupId: number, response: unknown): SnapshotPlanResult {
    const details = response as GroupDetailsLike;
    const result: SnapshotPlanResult = { membersConsidered: 0, snapshotsEnqueued: 0, snapshotsSkippedFresh: 0 };
    if (!Array.isArray(details.memberships)) return result;
    const now = Date.now();
    for (const m of details.memberships) {
        const player = m.player;
        const rsn = player?.displayName ?? player?.username;
        if (!isNonBlank(rsn)) continue;
        result.membersConsidered += 1;
        const womChangedAtMs = parseIsoMs(player!.lastChangedAt);
        const outcome = planSnapshotMember({ clanId, womGroupId, rsn, womChangedAtMs, now });
        const counter = SNAPSHOT_COUNTERS[outcome];
        if (counter) result[counter] += 1;
    }
    logger.info(
        `[wom-snapshot-planner] clan=${clanId} considered=${result.membersConsidered} enqueued=${result.snapshotsEnqueued} skipped_fresh=${result.snapshotsSkippedFresh}`,
    );
    return result;
}
