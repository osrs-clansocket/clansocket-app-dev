import {
    STATUS_PENDING,
    STATUS_IN_FLIGHT,
    STATUS_APPLIED,
    STATUS_FAILED,
} from "../../../shared/constants/outbound-status.js";
import { HTTP_OK } from "../../../shared/http/http-status.js";
import { computeBackoff } from "../../../shared/outbound/backoff.js";
import { runWomWrite } from "../db-runners.js";

const MAX_ATTEMPTS = 5;
const MAX_ATTEMPTS_5XX = 10;
const BACKOFF_BASE_MS = 1000;
const BACKOFF_MULTIPLIER = 2;
const BACKOFF_MAX_MS = 60000;
const HTTP_SERVER_ERROR_MIN = 500;
const HTTP_SERVER_ERROR_MAX = 600;

export function markWomFlight(clanId: string, queueId: string): boolean {
    const result = runWomWrite(
        clanId,
        `UPDATE clan_wom_outbound_events
         SET status = ?, attempts = attempts + 1
         WHERE queue_id = ? AND status = ?`,
        STATUS_IN_FLIGHT,
        queueId,
        STATUS_PENDING,
    );
    return result.changes > 0;
}

export function markWomApplied(clanId: string, queueId: string, responseBodyHash: string | null): void {
    runWomWrite(
        clanId,
        `UPDATE clan_wom_outbound_events
         SET status = ?, fired_at = ?, response_body_hash = ?, result_code = ?, next_attempt_at = NULL
         WHERE queue_id = ?`,
        STATUS_APPLIED,
        Date.now(),
        responseBodyHash,
        HTTP_OK,
        queueId,
    );
}

export function markDeadLetter(clanId: string, queueId: string, errorCode: number): void {
    runWomWrite(
        clanId,
        `UPDATE clan_wom_outbound_events
         SET status = ?, fired_at = ?, result_code = ?, next_attempt_at = NULL
         WHERE queue_id = ?`,
        STATUS_FAILED,
        Date.now(),
        errorCode,
        queueId,
    );
}

export function markWomFailed(clanId: string, queueId: string, errorCode: number, attemptNo: number): void {
    const is5xx = errorCode >= HTTP_SERVER_ERROR_MIN && errorCode < HTTP_SERVER_ERROR_MAX;
    const maxAttempts = is5xx ? MAX_ATTEMPTS_5XX : MAX_ATTEMPTS;
    if (attemptNo >= maxAttempts) {
        markDeadLetter(clanId, queueId, errorCode);
        return;
    }
    const delay = computeBackoff({
        attemptNo,
        baseMs: BACKOFF_BASE_MS,
        multiplier: BACKOFF_MULTIPLIER,
        maxMs: BACKOFF_MAX_MS,
    });
    runWomWrite(
        clanId,
        `UPDATE clan_wom_outbound_events
         SET status = ?, result_code = ?, next_attempt_at = ?
         WHERE queue_id = ?`,
        STATUS_PENDING,
        errorCode,
        Date.now() + delay,
        queueId,
    );
}
