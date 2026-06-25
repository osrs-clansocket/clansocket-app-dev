import { DB_NAMES, getDb } from "../../../core/database.js";
import { insertClanManager } from "../../access/clan-manager-store.js";
import { bindAccountHash } from "../../../site/site-accounts/index.js";
import { rsnByHash } from "../../../plugin/rsn-lookup.js";
import { ClanAuditActions } from "../clan-audit-actions.js";
import { recordClanAudit } from "../clan-audit/record.js";
import type { SourceEntry } from "./types.js";

function loadOwnerHash(previousOwner: string): string {
    const db = getDb(DB_NAMES.APP);
    const row = db
        .prepare(
            `SELECT account_hash FROM clansocket_account_bindings WHERE site_account_id = ? AND revoked_at IS NULL LIMIT 1`,
        )
        .get(previousOwner) as { account_hash: string } | undefined;
    if (!row) throw new Error(`no_owner_hash: previousOwner=${previousOwner}`);
    return row.account_hash;
}

interface ApplyOwnerArgs {
    clanId: string;
    previousOwner: string;
    ownerHash: string;
    ownerRsn: string | null;
    actor: string;
}

function applyOwnerReinstate(a: ApplyOwnerArgs): void {
    const db = getDb(DB_NAMES.APP);
    db.prepare(
        `UPDATE clansocket_clans SET owner_site_account_id = ?, owner_account_hash = ?, owner_rsn = ?, claimed_at = ? WHERE id = ?`,
    ).run(a.previousOwner, a.ownerHash, a.ownerRsn, Date.now(), a.clanId);
    bindAccountHash(a.previousOwner, a.ownerHash);
    insertClanManager({
        siteAccountId: a.previousOwner,
        clanId: a.clanId,
        role: "owner",
        grantedVia: "transfer",
        grantedBySiteAccountId: a.actor,
    });
}

export function applyClaimRevert(
    clanId: string,
    row: SourceEntry,
    payload: Record<string, unknown>,
    actor: string,
): void {
    const previousOwner = payload.previousOwnerSiteAccountId as string | null;
    const newOwner = payload.newOwnerSiteAccountId as string | undefined;
    if (!previousOwner) throw new Error(`no_previous_owner: clanId=${clanId} auditId=${row.id}`);
    const ownerHash = loadOwnerHash(previousOwner);
    const ownerRsn = rsnByHash(ownerHash);
    applyOwnerReinstate({ clanId, previousOwner, ownerHash, ownerRsn, actor });
    recordClanAudit(clanId, {
        actor,
        action: ClanAuditActions.ClaimTransferred,
        targetId: clanId,
        payload: {
            newOwnerSiteAccountId: previousOwner,
            previousOwnerSiteAccountId: newOwner ?? null,
            revertsAuditId: row.id,
        },
    });
}
