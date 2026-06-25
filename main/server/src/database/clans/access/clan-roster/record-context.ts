import type Database from "better-sqlite3";
import { DB_NAMES, getDb } from "../../../core/database.js";
import { rsnByHash } from "../../../plugin/rsn-lookup.js";
import type { PreviousRoster } from "./record-inserts.js";

export { canonicalizeMembers } from "./canonicalize-members.js";

export interface RosterContext {
    previous: PreviousRoster | undefined;
    capturedByRsn: string | null;
    clanName: string;
}

function loadPreviousRoster(db: Database.Database): PreviousRoster | undefined {
    return db.prepare("SELECT fingerprint, members_json FROM clan_rosters ORDER BY captured_at DESC LIMIT 1").get() as
        | PreviousRoster
        | undefined;
}

function loadClanName(clanId: string): string {
    const row = getDb(DB_NAMES.APP).prepare("SELECT display_name FROM clansocket_clans WHERE id = ?").get(clanId) as
        | { display_name: string }
        | undefined;
    return row?.display_name ?? "";
}

export function buildRosterContext(
    db: Database.Database,
    clanId: string,
    capturedByAccountHash: string,
): RosterContext {
    return {
        previous: loadPreviousRoster(db),
        capturedByRsn: rsnByHash(capturedByAccountHash),
        clanName: loadClanName(clanId),
    };
}
