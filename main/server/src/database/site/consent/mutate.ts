import { DB_NAMES } from "../../core/database.js";
import { execDb, wasWritten } from "../../core/operations.js";

export function expirePendingConsents(now: number = Date.now()): number {
    return execDb(
        DB_NAMES.APP,
        `UPDATE clansocket_consent_requests
         SET status = 'expired', resolved_at = $now
         WHERE status = 'pending' AND expires_at < $now`,
        { now },
    ).changes;
}

export function cancelConsentRequest(id: number, requestingSiteAccountId: string): boolean {
    return wasWritten(
        execDb(
            DB_NAMES.APP,
            `UPDATE clansocket_consent_requests
             SET status = 'cancelled', resolved_at = ?
             WHERE id = ? AND requesting_site_account_id = ? AND status = 'pending'`,
            Date.now(),
            id,
            requestingSiteAccountId,
        ),
    );
}

export function resolveConsentRequest(id: number, action: "confirmed" | "rejected"): boolean {
    return wasWritten(
        execDb(
            DB_NAMES.APP,
            `UPDATE clansocket_consent_requests
             SET status = ?, resolved_at = ?
             WHERE id = ? AND status = 'pending'`,
            action,
            Date.now(),
            id,
        ),
    );
}
