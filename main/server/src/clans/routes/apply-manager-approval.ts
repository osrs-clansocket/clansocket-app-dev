import { ClanAuditActions, recordClanAudit } from "../../database/index.js";
import { insertClanManager } from "../../database/clans/access/clan-manager-store.js";
import { resolveManagerRequest } from "../../database/clans/access/request-store.js";
import { bindAccountHash } from "../../database/site/site-accounts/index.js";

export function applyManagerApproval(resolved: ReturnType<typeof resolveManagerRequest>, approverSid: string): void {
    if (!resolved) return;
    insertClanManager({
        siteAccountId: resolved.site_account_id,
        clanId: resolved.clan_id,
        role: "manager",
        grantedVia: "approval_2fa",
        grantedBySiteAccountId: approverSid,
    });
    if (resolved.declared_account_hash) {
        bindAccountHash(resolved.site_account_id, resolved.declared_account_hash);
    }
    recordClanAudit(resolved.clan_id, {
        actor: approverSid,
        action: ClanAuditActions.ManagerRequestApproved,
        targetId: resolved.id,
        payload: { targetSiteAccountId: resolved.site_account_id, declaredRsn: resolved.declared_rsn },
    });
}
