import {
    STATUS_PENDING,
    STATUS_IN_FLIGHT,
    STATUS_APPLIED,
    STATUS_FAILED,
} from "../../../shared/constants/outbound-status.js";
import { HTTP_OK } from "../../../shared/http/http-status.js";
import { computeBackoff } from "../../../shared/outbound/backoff.js";
import { runBotWrite } from "../db-runners.js";

const MAX_ATTEMPTS = 10;
const BACKOFF_BASE_MS = 1000;
const BACKOFF_MULTIPLIER = 4;
const BACKOFF_MAX_MS = 600000;

export function markInFlight(queueId: string): boolean {
    const result = runBotWrite(
        `UPDATE discord_outbound_events
         SET status = ?, attempts = attempts + 1
         WHERE queue_id = ? AND status = ?`,
        STATUS_IN_FLIGHT,
        queueId,
        STATUS_PENDING,
    );
    return result.changes > 0;
}

export function markApplied(queueId: string, responseMessageId: string | null): void {
    runBotWrite(
        `UPDATE discord_outbound_events
         SET status = ?, fired_at = ?, response_message_id = ?, result_code = ?, next_attempt_at = NULL
         WHERE queue_id = ?`,
        STATUS_APPLIED,
        Date.now(),
        responseMessageId,
        HTTP_OK,
        queueId,
    );
}

const FAIL_PERMANENT_SQL = `UPDATE discord_outbound_events SET status = ?, fired_at = ?, result_code = ?, next_attempt_at = NULL WHERE queue_id = ?`;
const FAIL_RETRY_SQL = `UPDATE discord_outbound_events SET status = ?, result_code = ?, next_attempt_at = ? WHERE queue_id = ?`;

export function markFailed(queueId: string, errorCode: number, attemptNo: number): void {
    if (attemptNo >= MAX_ATTEMPTS) {
        runBotWrite(FAIL_PERMANENT_SQL, STATUS_FAILED, Date.now(), errorCode, queueId);
        return;
    }
    const delay = computeBackoff({
        attemptNo,
        baseMs: BACKOFF_BASE_MS,
        multiplier: BACKOFF_MULTIPLIER,
        maxMs: BACKOFF_MAX_MS,
    });
    runBotWrite(FAIL_RETRY_SQL, STATUS_PENDING, errorCode, Date.now() + delay, queueId);
}
