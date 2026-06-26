import { ClanAuditActions } from "../../database/clans/audit/clan-audit-actions.js";
import { recordClanAudit } from "../../database/clans/audit/clan-audit/record.js";
import { clanWomIdentity } from "../../database/wom/identity/get-clan-identity.js";
import { markBackfillCompleted } from "../../database/wom/identity/mark-backfill-completed.js";

export function recordBackfillDone(clanId: string): void {
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
