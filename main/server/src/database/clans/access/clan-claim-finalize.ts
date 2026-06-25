import { getDb, DB_NAMES, ensureClanDir } from "../../core/database.js";
import { orCreateClan, type ClanRow } from "../clan-store.js";
import { insertClanManager } from "./clan-manager-store.js";
import { bindAccountHash } from "../../site/site-accounts/index.js";
import { recordClanAudit } from "../audit/clan-audit/record.js";
import { ClanAuditActions } from "../audit/clan-audit-actions.js";

export class ClanClaimError extends Error {
    constructor(
        public readonly code: string,
        message: string,
    ) {
        super(message);
    }
}

export interface FinalizeClaimArgs {
    displayName: string;
    slug: string;
    siteAccountId: string;
    accountHash: string;
    rsn: string;
}

function assertClaimAvailable(clan: ClanRow, args: FinalizeClaimArgs): void {
    if (clan.status === "active" && clan.owner_account_hash && clan.owner_account_hash !== args.accountHash) {
        throw new ClanClaimError("already_claimed", `Clan "${args.displayName}" is already claimed.`);
    }
    const db = getDb(DB_NAMES.APP);
    const slugCollision = db
        .prepare(`SELECT id FROM clansocket_clans WHERE slug = ? AND id != ?`)
        .get(args.slug, clan.id) as { id: string } | undefined;
    if (slugCollision) {
        throw new ClanClaimError("slug_collision", `Slug "${args.slug}" is taken by another clan.`);
    }
}

function persistClaim(clanId: string, args: FinalizeClaimArgs, now: number): void {
    const db = getDb(DB_NAMES.APP);
    db.transaction(() => {
        db.prepare(
            `UPDATE clansocket_clans
             SET slug = ?, status = 'active', owner_account_hash = ?, owner_rsn = ?, owner_site_account_id = ?, claimed_at = ?
             WHERE id = ?`,
        ).run(args.slug, args.accountHash, args.rsn, args.siteAccountId, now, clanId);
        bindAccountHash(args.siteAccountId, args.accountHash);
    })();
}

function applySideEffects(clanId: string, args: FinalizeClaimArgs): void {
    insertClanManager({
        clanId,
        siteAccountId: args.siteAccountId,
        role: "owner",
        grantedVia: "owner_self",
        grantedBySiteAccountId: args.siteAccountId,
    });
    ensureClanDir(clanId);
    recordClanAudit(clanId, {
        actor: args.siteAccountId,
        action: ClanAuditActions.ClaimCompleted,
        targetId: clanId,
        payload: { displayName: args.displayName, slug: args.slug },
    });
}

export function finalizeClanClaim(args: FinalizeClaimArgs): ClanRow {
    const now = Date.now();
    const clan = orCreateClan(args.displayName);
    assertClaimAvailable(clan, args);
    persistClaim(clan.id, args, now);
    applySideEffects(clan.id, args);
    return {
        ...clan,
        slug: args.slug,
        status: "active",
        owner_account_hash: args.accountHash,
        owner_site_account_id: args.siteAccountId,
        claimed_at: now,
    };
}
