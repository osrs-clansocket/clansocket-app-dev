import { listMemberClans } from "../../clans/read-member.js";
import { getDb, DB_NAMES, getClanDb } from "../../database/index.js";
import { SQL_TABLES } from "../../database/core/sql-columns.js";
import { sqlPlaceholders } from "../../database/core/operations/index.js";
import { hashesForAccount } from "../../database/site/site-accounts/index.js";
import { SCOPE_APP } from "../scopes/user-scope/index.js";
import { defineTopic } from "./subscriber-projection.js";
import type { ProjectionTopic, ProjectionTrigger } from "./projection-types.js";
import { scopeKeyClan } from "./writes-stream.js";

interface ClanIdRow {
    id: string;
}

function clanHasHash(clanId: string, hashes: readonly string[]): boolean {
    const memberRow = getClanDb(clanId)
        .prepare(`SELECT 1 FROM clan_members WHERE account_hash IN (${sqlPlaceholders(hashes.length)}) LIMIT 1`)
        .get(...hashes);
    return Boolean(memberRow);
}

function appendClanTriggers(triggers: ProjectionTrigger[], hashes: readonly string[]): void {
    if (hashes.length === 0) return;
    const clanRows = getDb(DB_NAMES.APP)
        .prepare(
            `SELECT id FROM clansocket_clans WHERE status = 'active' AND archived_at IS NULL AND claimed_at IS NOT NULL`,
        )
        .all() as ClanIdRow[];
    for (const c of clanRows) {
        if (clanHasHash(c.id, hashes)) {
            triggers.push({ scopeKey: scopeKeyClan(c.id), table: SQL_TABLES.CLAN_ROSTERS });
        }
    }
}

export function memberClansTopic(siteAccountId: string): ProjectionTopic {
    const triggers: ProjectionTrigger[] = [
        { scopeKey: SCOPE_APP, table: SQL_TABLES.CLANSOCKET_CLANS },
        { scopeKey: SCOPE_APP, table: SQL_TABLES.CLANSOCKET_ACCOUNT_BINDINGS },
    ];
    appendClanTriggers(triggers, hashesForAccount(siteAccountId));
    return defineTopic({
        triggers,
        query: () => listMemberClans(siteAccountId) as unknown as Record<string, unknown>[],
        keyOf: (row) => String(row.id),
    });
}
