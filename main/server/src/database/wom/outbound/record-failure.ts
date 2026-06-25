import { runWomWrite } from "../db-runners.js";

export interface OutboundFailureInput {
    clanId: string;
    queueId: string;
    attemptNo: number;
    errorCode: number;
    errorBodyHash?: string | null;
}

export function recordOutbound(input: OutboundFailureInput): void {
    runWomWrite(
        input.clanId,
        `INSERT INTO clan_wom_outbound_failures (queue_id, attempt_no, failed_at, error_code, error_body_hash)
         VALUES (?, ?, ?, ?, ?)`,
        input.queueId,
        input.attemptNo,
        Date.now(),
        input.errorCode,
        input.errorBodyHash ?? null,
    );
}
