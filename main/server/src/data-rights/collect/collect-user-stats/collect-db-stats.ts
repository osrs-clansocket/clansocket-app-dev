import { getClanDb } from "../../../database/core/database.js";
import { CLAN_DB_SITE_ACCOUNT_TABLES, CLAN_DB_USER_TABLES } from "../../scopes/manifest/index.js";
import { resolveClanWindows } from "../../temporal-correlation.js";
import { statOne, statTemporalDiffs, statTemporalMembers } from "./stat-ops.js";
import { acc } from "./utils.js";
import type { StatsAcc } from "./stats-acc-types.js";

export function collectDbStats(
    s: StatsAcc,
    clanId: string,
    siteAccountId: string,
    accountHashes: readonly string[],
): void {
    const clanDb = getClanDb(clanId);
    const clanDbKey = `clan:${clanId}`;
    for (const hash of accountHashes) {
        for (const { table, column } of CLAN_DB_USER_TABLES) {
            acc(s.stats, s.dbsTouched, clanDbKey, statOne(clanDb, table, column, hash));
        }
    }
    for (const { table, column } of CLAN_DB_SITE_ACCOUNT_TABLES) {
        acc(s.stats, s.dbsTouched, clanDbKey, statOne(clanDb, table, column, siteAccountId));
    }
    for (const hash of accountHashes) {
        const windows = resolveClanWindows(clanId, [hash]);
        if (windows.length === 0) continue;
        acc(s.stats, s.dbsTouched, clanDbKey, statTemporalMembers(clanId, windows));
        acc(s.stats, s.dbsTouched, clanDbKey, statTemporalDiffs(clanId, windows));
    }
}
