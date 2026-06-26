import { DB_NAMES, getClanDb, getDb, hashesForAccount, resolveClanPosture, getAccountRsn } from "../database/index.js";
import { NAME_CHANGED_SUFFIX } from "../database/plugin/saturated-tables.js";
import { clanLegacyRsns } from "./orphan-rsns.js";

interface ActiveClanRow {
    id: string;
    slug: string;
    display_name: string;
}

import type { MemberClan, LegacyRsnMatch } from "./legacy-rsn-types.js";

export type { MemberClan, LegacyRsnMatch } from "./legacy-rsn-types.js";

export function memberClans(siteAccountId: string): MemberClan[] {
    const rows = getDb(DB_NAMES.APP)
        .prepare(
            `SELECT id, slug, display_name FROM clansocket_clans
             WHERE status = 'active' AND archived_at IS NULL`,
        )
        .all() as ActiveClanRow[];
    const out: MemberClan[] = [];
    for (const r of rows) {
        if (resolveClanPosture(siteAccountId, r.id) === null) continue;
        out.push({ id: r.id, slug: r.slug, displayName: r.display_name });
    }
    return out;
}

export function legacyRsns(siteAccountId: string): LegacyRsnMatch[] {
    const out: LegacyRsnMatch[] = [];
    for (const clan of memberClans(siteAccountId)) {
        clanLegacyRsns(clan, out);
    }
    return out;
}

export interface ClaimResult {
    claimedRows: number;
}

export class LegacyClaimError extends Error {
    constructor(
        public readonly code: string,
        message: string,
    ) {
        super(message);
    }
}

function resolveSingleHash(siteAccountId: string): string {
    const hashes = hashesForAccount(siteAccountId);
    if (hashes.length === 0) {
        throw new LegacyClaimError("no_account", "Verify your RSN with the plugin before claiming legacy data.");
    }
    if (hashes.length > 1) {
        throw new LegacyClaimError(
            "multiple_accounts",
            "Multiple OSRS accounts bound. Pick one in your profile before claiming legacy data.",
        );
    }
    return hashes[0];
}

export function claimLegacyRsn(siteAccountId: string, clanSlug: string, legacyRsn: string): ClaimResult {
    const memberClan = memberClans(siteAccountId).find((c) => c.slug === clanSlug);
    if (!memberClan) {
        throw new LegacyClaimError("not_a_member", "You are not a member of that clan.");
    }
    const targetHash = resolveSingleHash(siteAccountId);
    const verified = getAccountRsn(targetHash);
    if (!verified) {
        throw new LegacyClaimError("no_verified_rsn", "Your RSN is not currently verified.");
    }
    const suffixed = `${legacyRsn}${NAME_CHANGED_SUFFIX}`;
    const result = getClanDb(memberClan.id)
        .prepare(`UPDATE clan_chats SET sender_rsn = ?, account_hash = ? WHERE LOWER(sender_rsn) = LOWER(?)`)
        .run(verified.rsn, targetHash, suffixed);
    return { claimedRows: result.changes };
}
