import { createHash, randomInt } from "node:crypto";
import logger from "@clansocket/logger";
import { WOMClient } from "@wise-old-man/utils";
import type { PendingWomRow } from "../../database/wom/outbound/list-pending.js";
import { recordOutbound } from "../../database/wom/outbound/record-failure.js";
import { markWomApplied, markDeadLetter, markWomFailed } from "../../database/wom/outbound/transition.js";
import { recordWom429, recordSent, recordWomSuccess } from "../../database/wom/rate-window/updater-rate.js";
import {
    HTTP_BAD_REQUEST,
    HTTP_FORBIDDEN,
    HTTP_NOT_FOUND,
    HTTP_TOO_MANY_REQUESTS,
    HTTP_UNAUTHORIZED,
} from "../../shared/http/http-status.js";
import type { WomPayload } from "../types/payload-type.js";
import { dispatchWithTimeout } from "./sdk-handlers.js";
import { safeRouteResponse } from "./runewatch-block-check.js";
import { scheduleWake } from "./wake-scheduler.js";
import { breakerNoteFail, breakerNoteOk } from "./breaker.js";

const BACKOFF_429_MIN_MS = 30000;
const BACKOFF_429_MAX_MS = 90001;
const NETWORK_ERROR_BACKOFF_MS = 60000;
const FAILED_REQUEST_ERROR_CODE = 0;
const HTTP_SERVER_ERROR_MIN = 500;
const HTTP_SERVER_ERROR_MAX = 600;

function isServerError(statusCode: number): boolean {
    return statusCode >= HTTP_SERVER_ERROR_MIN && statusCode < HTTP_SERVER_ERROR_MAX;
}

const CALLER_ERROR_STATUSES = new Set<number>([HTTP_BAD_REQUEST, HTTP_UNAUTHORIZED, HTTP_FORBIDDEN, HTTP_NOT_FOUND]);

interface SdkError {
    statusCode?: number;
    message?: string;
}

function backoff429Ms(): number {
    return randomInt(BACKOFF_429_MIN_MS, BACKOFF_429_MAX_MS);
}

export interface FireRequestArgs {
    clanId: string;
    head: PendingWomRow;
    creds: WomPayload;
    windowCountBefore: number;
    consecutive429Before: number;
    rateLimit: number;
}

interface FailureCtx {
    clanId: string;
    head: PendingWomRow;
    attemptNo: number;
    consecutive429Before: number;
}

function handleFireFailure(ctx: FailureCtx, err: unknown): void {
    const now = Date.now();
    const sdkErr = err as SdkError;
    const statusCode = sdkErr.statusCode ?? FAILED_REQUEST_ERROR_CODE;
    const message = err instanceof Error ? err.message : String(err);
    logger.error(
        `[wom-dispatcher] sdk call failed for clan ${ctx.clanId} queue ${ctx.head.queue_id} (status=${statusCode}): ${message}`,
    );
    recordOutbound({ clanId: ctx.clanId, attemptNo: ctx.attemptNo, queueId: ctx.head.queue_id, errorCode: statusCode });
    if (CALLER_ERROR_STATUSES.has(statusCode)) {
        markDeadLetter(ctx.clanId, ctx.head.queue_id, statusCode);
        scheduleWake(ctx.clanId, now);
        return;
    }
    if (statusCode === HTTP_TOO_MANY_REQUESTS) {
        recordWom429(ctx.clanId, ctx.consecutive429Before);
        markWomFailed(ctx.clanId, ctx.head.queue_id, statusCode, ctx.attemptNo);
        scheduleWake(ctx.clanId, now + backoff429Ms());
        return;
    }
    if (isServerError(statusCode)) breakerNoteFail(ctx.clanId);
    markWomFailed(ctx.clanId, ctx.head.queue_id, statusCode, ctx.attemptNo);
    const nextWake = statusCode === FAILED_REQUEST_ERROR_CODE ? now + NETWORK_ERROR_BACKOFF_MS : now;
    scheduleWake(ctx.clanId, nextWake);
}

export async function fireRequest(args: FireRequestArgs): Promise<void> {
    const { clanId, head, creds, windowCountBefore, consecutive429Before, rateLimit } = args;
    recordSent(clanId, windowCountBefore, rateLimit);
    const client = new WOMClient({ apiKey: creds.api_key, userAgent: creds.user_agent });
    const attemptNo = head.attempts + 1;
    try {
        const result = await dispatchWithTimeout(client, head);
        if (result === undefined) {
            throw new Error(
                "SDK returned undefined - upstream status outside the SDK handled set (400/403/404/429/500)",
            );
        }
        const bodyHash = createHash("sha256").update(JSON.stringify(result)).digest("hex");
        markWomApplied(clanId, head.queue_id, bodyHash);
        recordWomSuccess(clanId);
        breakerNoteOk(clanId);
        safeRouteResponse(clanId, head, result);
        scheduleWake(clanId, Date.now());
    } catch (err) {
        handleFireFailure({ clanId, head, attemptNo, consecutive429Before }, err);
    }
}
