import { getClanDb, clanPluginDb } from "../../../core/database.js";
import { upsertRsnHistory } from "../../../site/rsn/rsn-history.js";
import { writeSnapshot, upsertClanAccount, upsertHistory } from "./clan-db-writes.js";
import { recordDrift, upsertCurrentState, upsertSession } from "./db-writes.js";
import type { PluginIdentityRecord } from "./types.js";

function lookupExistingRsn(clanDb: ReturnType<typeof getClanDb>, accountHash: string): string | undefined {
    const row = clanDb.prepare("SELECT latest_rsn FROM clan_accounts WHERE account_hash = ?").get(accountHash) as
        | { latest_rsn: string }
        | undefined;
    return row?.latest_rsn;
}

export function recordPluginIdentity(
    clanId: string,
    mode: string,
    sessionId: string,
    identity: PluginIdentityRecord,
): void {
    const now = Date.now();
    const conn = clanPluginDb(clanId, mode);
    const clanDb = getClanDb(clanId);
    const existingRsn = lookupExistingRsn(clanDb, identity.accountHash);
    const existed = existingRsn !== undefined;
    conn.transaction(() => {
        if (existed && existingRsn!.toLowerCase() !== identity.rsn.toLowerCase()) {
            recordDrift({ conn, identity, sessionId, now, existingRsn });
        }
        upsertSession(conn, sessionId, identity, now);
        upsertCurrentState(conn, sessionId, identity, now);
    })();
    clanDb.transaction(() => {
        upsertClanAccount(clanDb, identity, existed, now);
        upsertHistory(clanDb, clanId, identity, now);
        writeSnapshot(clanDb, clanId, identity, now);
    })();
    upsertRsnHistory(identity, now);
}
