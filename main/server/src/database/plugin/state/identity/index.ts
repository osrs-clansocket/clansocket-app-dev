import { getClanDb, clanPluginDb } from "../../../core/database.js";
import { upsertRsnHistory } from "../../../site/rsn/rsn-history.js";
import { writeSnapshot, upsertClanAccount, upsertHistory } from "./clan-db-writes.js";
import { recordDrift, upsertCurrentState, upsertSession } from "./db-writes.js";
import type { PluginIdentityRecord } from "./types.js";

export type { PluginIdentityRecord } from "./types.js";
export { recordPluginDisconnect, recordPluginLogin, touchPluginCurrent } from "./state-transitions.js";

function lookupExistingRsn(clanDb: ReturnType<typeof getClanDb>, accountHash: string): string | undefined {
    const row = clanDb.prepare("SELECT latest_rsn FROM clan_accounts WHERE account_hash = ?").get(accountHash) as
        | { latest_rsn: string }
        | undefined;
    return row?.latest_rsn;
}

interface PluginTxArgs {
    conn: ReturnType<typeof clanPluginDb>;
    sessionId: string;
    identity: PluginIdentityRecord;
    existingRsn: string | undefined;
    now: number;
}

function runPluginTransaction(args: PluginTxArgs): void {
    const { conn, sessionId, identity, existingRsn, now } = args;
    conn.transaction(() => {
        if (existingRsn !== undefined && existingRsn.toLowerCase() !== identity.rsn.toLowerCase()) {
            recordDrift({ conn, identity, sessionId, now, existingRsn });
        }
        upsertSession(conn, sessionId, identity, now);
        upsertCurrentState(conn, sessionId, identity, now);
    })();
}

interface ClanTxArgs {
    clanDb: ReturnType<typeof getClanDb>;
    clanId: string;
    identity: PluginIdentityRecord;
    existed: boolean;
    now: number;
}

function runClanTransaction(args: ClanTxArgs): void {
    const { clanDb, clanId, identity, existed, now } = args;
    clanDb.transaction(() => {
        upsertClanAccount(clanDb, identity, existed, now);
        upsertHistory(clanDb, clanId, identity, now);
        writeSnapshot(clanDb, clanId, identity, now);
    })();
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
    runPluginTransaction({ conn, sessionId, identity, existingRsn, now });
    runClanTransaction({ clanDb, clanId, identity, now, existed: existingRsn !== undefined });
    upsertRsnHistory(identity, now);
}
