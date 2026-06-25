import { readVaultEntry } from "../../clan-vault/index.js";
import { ClanAuditActions } from "../../database/clans/audit/clan-audit-actions.js";
import { recordClanAudit } from "../../database/clans/audit/clan-audit/record.js";
import { HTTP_UNAUTHORIZED } from "../../shared/http/http-status.js";
import { clanWomIdentity } from "../../database/wom/identity/get-clan-identity.js";
import { markBackfillCompleted } from "../../database/wom/identity/mark-backfill-completed.js";
import { nextDueAt, pendingForClan } from "../../database/wom/outbound/list-pending.js";
import { markWomFailed, markWomFlight } from "../../database/wom/outbound/transition.js";
import type { WomPayload } from "../types/payload-type.js";
import { validateWomPayload } from "../validators/payload-validator.js";
import { fireRequest } from "./fire-handler.js";
import { registerOnWake, scheduleWake } from "./wake-scheduler.js";
import { checkRateWindow } from "./rate-window-checker.js";

const ANON_RATE_LIMIT = 20;
const KEYED_RATE_LIMIT = 100;

function recordBackfillDone(clanId: string): void {
    const identity = clanWomIdentity(clanId);
    if (!identity || identity.last_backfill_status !== "in_progress") return;
    const result = markBackfillCompleted(clanId);
    if (!result.changed) return;
    const msElapsed = result.startedAtMs !== null ? Date.now() - result.startedAtMs : 0;
    recordClanAudit(clanId, {
        actor: null,
        actorKind: "system",
        action: ClanAuditActions.WomBackfillCompleted,
        targetId: null,
        payload: { rowsInserted: 0, rowsUpdated: 0, rowsSkipped: 0, msElapsed },
    });
}

function failPending(clanId: string): void {
    for (const item of pendingForClan(clanId)) {
        markWomFailed(clanId, item.queue_id, HTTP_UNAUTHORIZED, item.attempts + 1);
    }
}

function deferIfIdle(clanId: string, now: number): boolean {
    const pending = pendingForClan(clanId);
    if (pending.length > 0) return false;
    recordBackfillDone(clanId);
    const nextDue = nextDueAt(clanId);
    if (nextDue !== null && nextDue > now) scheduleWake(clanId, nextDue);
    return true;
}

registerOnWake((clanId) => processQueueOnce(clanId));

async function loadDispatcherCreds(clanId: string): Promise<WomPayload | null> {
    return readVaultEntry<WomPayload>(
        clanId,
        "wom",
        { kind: "system", component: "wom-dispatcher" },
        validateWomPayload,
    );
}

export async function processQueueOnce(clanId: string): Promise<void> {
    const creds = await loadDispatcherCreds(clanId);
    if (!creds) {
        failPending(clanId);
        return;
    }
    const now = Date.now();
    if (deferIfIdle(clanId, now)) return;
    const rateLimit = creds.api_key ? KEYED_RATE_LIMIT : ANON_RATE_LIMIT;
    const rate = checkRateWindow(clanId, rateLimit, now);
    if (!rate.proceed) return;
    const head = pendingForClan(clanId)[0];
    if (!markWomFlight(clanId, head.queue_id)) return;
    await fireRequest({
        clanId,
        head,
        creds,
        rateLimit,
        windowCountBefore: rate.windowCount,
        consecutive429Before: rate.consecutive429,
    });
}
