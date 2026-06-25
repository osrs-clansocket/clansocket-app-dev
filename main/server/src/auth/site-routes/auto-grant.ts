import { type Response } from "express";
import {
    ClanAuditActions,
    getRosterRank,
    insertClanManager,
    isWhitelistedRank,
    recordClanAudit,
    type rsnsByAccount,
} from "../../database/index.js";
import type { clanBySlug } from "../../database/clans/clan-store.js";

type Clan = NonNullable<ReturnType<typeof clanBySlug>>;
type RsnRow = ReturnType<typeof rsnsByAccount>[number];

function applyAutoGrant(siteAccountId: string, clan: Clan, rsnRow: RsnRow, rank: string): void {
    insertClanManager({
        siteAccountId,
        clanId: clan.id,
        role: "manager",
        grantedVia: "in_game_consent",
        grantedBySiteAccountId: siteAccountId,
    });
    recordClanAudit(clan.id, {
        actor: siteAccountId,
        action: ClanAuditActions.ManagerGranted,
        targetId: siteAccountId,
        payload: {
            role: "manager",
            grantedVia: "in_game_consent",
            matchedRsn: rsnRow.rsn,
            matchedRank: rank,
        },
    });
}

export function tryAutoGrant(siteAccountId: string, clan: Clan, rsnRow: RsnRow, res: Response): boolean {
    const rank = getRosterRank(clan.id, rsnRow.rsn);
    if (rank === null || !isWhitelistedRank(clan.id, rank)) return false;
    applyAutoGrant(siteAccountId, clan, rsnRow, rank);
    res.json({
        rank,
        ok: true,
        status: "granted",
        slug: clan.slug,
        clanId: clan.id,
        rsn: rsnRow.rsn,
        message: `Verified '${rsnRow.rsn}' has rank '${rank}' in ${clan.display_name}, access granted.`,
    });
    return true;
}
