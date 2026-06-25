import { getClanDb } from "../../../../core/database.js";

export function loadHashRsns(
    clanId: string,
    allHashes: Set<string>,
): Record<string, { rsn: string; lastSeen: number }> {
    const out: Record<string, { rsn: string; lastSeen: number }> = {};
    if (allHashes.size === 0) return out;
    const hashList = Array.from(allHashes);
    const hashPlaceholders = hashList.map(() => "?").join(",");
    const rows = getClanDb(clanId)
        .prepare(
            `SELECT account_hash, latest_rsn, last_seen
             FROM clan_accounts WHERE account_hash IN (${hashPlaceholders})`,
        )
        .all(...hashList) as Array<{ account_hash: string; latest_rsn: string; last_seen: number }>;
    for (const row of rows) {
        out[row.account_hash] = { rsn: row.latest_rsn, lastSeen: row.last_seen };
    }
    return out;
}
