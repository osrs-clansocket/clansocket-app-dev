import { ClanAuditActions, recordClanAudit } from "../../../database/index.js";
import { type ClanRow } from "../../../database/clans/clan-store.js";

export function auditClaimRequested(clan: ClanRow, siteAccountId: string, rsn: string): void {
    recordClanAudit(clan.id, {
        actor: siteAccountId,
        action: ClanAuditActions.ClaimConsentRequested,
        targetId: clan.id,
        payload: { declaredRsn: rsn, declaredClanName: clan.display_name, declaredClanSlug: clan.slug },
    });
}
