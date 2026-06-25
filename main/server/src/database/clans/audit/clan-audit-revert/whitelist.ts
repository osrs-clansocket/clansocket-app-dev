import { revokeWhitelistEntry } from "../../access/clan-whitelist-store.js";
import { ClanAuditActions } from "../clan-audit-actions.js";
import { recordClanAudit } from "../clan-audit/record.js";
import type { SourceEntry } from "./types.js";

export function applyWhitelistRevert(clanId: string, row: SourceEntry, actor: string): void {
    if (!row.target_id) throw new Error(`no_target: clanId=${clanId} auditId=${row.id}`);
    revokeWhitelistEntry(row.target_id, clanId);
    recordClanAudit(clanId, {
        actor,
        action: ClanAuditActions.WhitelistRemoved,
        targetId: row.target_id,
        payload: { revertsAuditId: row.id },
    });
}
