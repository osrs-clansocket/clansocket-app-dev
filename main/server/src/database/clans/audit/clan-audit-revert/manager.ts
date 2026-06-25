import { insertClanManager, revokeClanManager } from "../../access/clan-manager-store.js";
import { ClanAuditActions } from "../clan-audit-actions.js";
import { recordClanAudit } from "../clan-audit/record.js";
import type { SourceEntry } from "./types.js";

export { applyRevokeRevert } from "./revoke-revert.js";

function reinstateOrRevoke(targetSiteAccountId: string, clanId: string, priorRole: string | null, actor: string): void {
    if (priorRole === null) {
        revokeClanManager(targetSiteAccountId, clanId, actor);
        return;
    }
    insertClanManager({
        clanId,
        siteAccountId: targetSiteAccountId,
        role: priorRole as "owner" | "manager",
        grantedVia: "owner_self",
        grantedBySiteAccountId: actor,
    });
}

export function applyGrantRevert(
    clanId: string,
    row: SourceEntry,
    payload: Record<string, unknown>,
    actor: string,
): void {
    const targetSiteAccountId = row.target_id;
    if (!targetSiteAccountId) throw new Error(`no_target: clanId=${clanId} auditId=${row.id}`);
    const priorRole = (payload.priorRole as string | null) ?? null;
    reinstateOrRevoke(targetSiteAccountId, clanId, priorRole, actor);
    recordClanAudit(clanId, {
        actor,
        action: ClanAuditActions.ManagerRevoked,
        targetId: targetSiteAccountId,
        payload: { priorRole: (payload.role as string | undefined) ?? null, revertsAuditId: row.id },
    });
}
