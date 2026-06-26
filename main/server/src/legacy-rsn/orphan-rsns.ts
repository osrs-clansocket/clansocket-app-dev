import { getClanDb } from "../database/index.js";
import { NAME_CHANGED_SUFFIX } from "../database/plugin/saturated-tables.js";
import { stripSuffix } from "./strip-suffix.js";
import type { LegacyRsnMatch, MemberClan } from "./legacy-rsn-types.js";

interface OrphanRsnRow {
    sender_rsn: string;
    n: number;
}

export function clanLegacyRsns(clan: MemberClan, out: LegacyRsnMatch[]): void {
    const db = getClanDb(clan.id);
    const rows = db
        .prepare(
            `SELECT sender_rsn, COUNT(*) AS n FROM clan_chats
             WHERE sender_rsn IS NOT NULL AND instr(sender_rsn, ?) > 0
             GROUP BY sender_rsn ORDER BY n DESC`,
        )
        .all(NAME_CHANGED_SUFFIX) as OrphanRsnRow[];
    for (const r of rows) {
        out.push({
            clanId: clan.id,
            clanSlug: clan.slug,
            clanDisplayName: clan.displayName,
            legacyRsn: stripSuffix(r.sender_rsn),
            matchCount: r.n,
        });
    }
}
