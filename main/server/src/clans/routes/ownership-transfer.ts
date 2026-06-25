import logger from "@clansocket/logger";
import type { Response } from "express";
import { HTTP_INTERNAL_ERROR } from "../../shared/http/http-status.js";
import { CLAIM_MESSAGE_INTERNAL, CLAIM_RANK_OWNER, CLAIM_REASON_INTERNAL } from "../../auth/claim-messages.js";
import { ClanAuditActions, DB_NAMES, getDb, recordClanAudit } from "../../database/index.js";
import { insertClanManager } from "../../database/clans/access/clan-manager-store.js";
import { rsnByHash } from "../../database/plugin/rsn-lookup.js";
import { bindAccountHash } from "../../database/site/site-accounts/index.js";
import type { PluginLiveSession } from "../../plugin-api/session/session-registry/index.js";

function applyTransfer(clanId: string, newOwnerSiteAccountId: string, newOwnerAccountHash: string): void {
    const db = getDb(DB_NAMES.APP);
    const now = Date.now();
    const prior = db.prepare(`SELECT owner_site_account_id FROM clansocket_clans WHERE id = ?`).get(clanId) as
        | { owner_site_account_id: string | null }
        | undefined;
    const newOwnerRsn = rsnByHash(newOwnerAccountHash);
    db.prepare(
        `UPDATE clansocket_clans SET owner_site_account_id = ?, owner_account_hash = ?, owner_rsn = ?, claimed_at = ? WHERE id = ?`,
    ).run(newOwnerSiteAccountId, newOwnerAccountHash, newOwnerRsn, now, clanId);
    bindAccountHash(newOwnerSiteAccountId, newOwnerAccountHash);
    insertClanManager({
        clanId,
        siteAccountId: newOwnerSiteAccountId,
        role: "owner",
        grantedVia: "transfer",
        grantedBySiteAccountId: newOwnerSiteAccountId,
    });
    recordClanAudit(clanId, {
        actor: prior?.owner_site_account_id ?? null,
        action: ClanAuditActions.ClaimTransferred,
        targetId: clanId,
        payload: { newOwnerSiteAccountId, previousOwnerSiteAccountId: prior?.owner_site_account_id ?? null },
    });
}

export interface TransferMatch {
    ownerSession: PluginLiveSession | null;
    clanMatch: PluginLiveSession | null;
}

export function findTransferMatch(refreshed: PluginLiveSession[], clanId: string): TransferMatch {
    let clanMatch: PluginLiveSession | null = null;
    for (const session of refreshed) {
        if (session.inGameClanId !== clanId) continue;
        clanMatch = session;
        if (session.inGameClanRank === CLAIM_RANK_OWNER) {
            return { ownerSession: session, clanMatch };
        }
    }
    return { ownerSession: null, clanMatch };
}

export function tryApplyTransfer(
    clan: { id: string; slug: string },
    siteAccountId: string,
    accountHash: string,
    res: Response,
): void {
    try {
        applyTransfer(clan.id, siteAccountId, accountHash);
        res.json({ ok: true, slug: clan.slug, clanId: clan.id });
    } catch (err) {
        logger.error(`[clansocket_clans] transfer failed: ${(err as Error).message}`);
        res.status(HTTP_INTERNAL_ERROR).json({
            ok: false,
            reason: CLAIM_REASON_INTERNAL,
            message: CLAIM_MESSAGE_INTERNAL,
        });
    }
}
