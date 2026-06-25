import { insertClanManager } from "../../access/clan-manager-store.js";
import { ClanAuditActions } from "../clan-audit-actions.js";
import { recordClanAudit } from "../clan-audit/record.js";
import type { SourceEntry } from "./types.js";

export function applyRevokeRevert(
    clanId: string,
    row: SourceEntry,
    payload: Record<string, unknown>,
    actor: string,
): void {
    const targetSiteAccountId = row.target_id;
    if (!targetSiteAccountId) throw new Error(`no_target: clanId=${clanId} auditId=${row.id}`);
    const priorRole = (payload.priorRole as string | null) ?? "manager";
    insertClanManager({
        clanId,
        siteAccountId: targetSiteAccountId,
        role: priorRole as "owner" | "manager",
        grantedVia: "owner_self",
        grantedBySiteAccountId: actor,
    });
    recordClanAudit(clanId, {
        actor,
        action: ClanAuditActions.ManagerGranted,
        targetId: targetSiteAccountId,
        payload: { role: priorRole, grantedVia: "revert", revertsAuditId: row.id },
    });
}
