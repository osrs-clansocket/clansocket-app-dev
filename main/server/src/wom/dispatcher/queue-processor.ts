import { readVaultEntry } from "../../clan-vault/index.js";
import { HTTP_UNAUTHORIZED } from "../../shared/http/http-status.js";
import { nextDueAt, pendingForClan } from "../../database/wom/outbound/list-pending.js";
import { markWomFailed, markWomFlight } from "../../database/wom/outbound/transition.js";
import type { WomPayload } from "../types/payload-type.js";
import { validateWomPayload } from "../validators/payload-validator.js";
import { fireRequest } from "./fire-handler.js";
import { recordBackfillDone } from "./recorder-backfill-done.js";
import { registerOnWake, scheduleWake } from "./wake-scheduler.js";
import { checkRateWindow } from "./rate-window-checker.js";
import { breakerOpenUntil } from "./breaker.js";

const ANON_RATE_LIMIT = 20;
const KEYED_RATE_LIMIT = 100;

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

function breakerGateOpen(clanId: string): boolean {
    const openUntil = breakerOpenUntil(clanId);
    if (openUntil === null) return true;
    scheduleWake(clanId, openUntil);
    return false;
}

async function dispatchHead(clanId: string, creds: WomPayload, now: number): Promise<void> {
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

export async function processQueueOnce(clanId: string): Promise<void> {
    if (!breakerGateOpen(clanId)) return;
    const creds = await loadDispatcherCreds(clanId);
    if (!creds) {
        failPending(clanId);
        return;
    }
    const now = Date.now();
    if (deferIfIdle(clanId, now)) return;
    await dispatchHead(clanId, creds, now);
}
