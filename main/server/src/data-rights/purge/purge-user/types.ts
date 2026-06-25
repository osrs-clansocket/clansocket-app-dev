import { DB_NAMES } from "../../../database/index.js";
import { selectRows } from "../../../shared/loaders/db-rows.js";

export interface PurgeUserResult {
    accountHash: string;
    siteAccountId: string;
    appTableDeletes: Record<string, number>;
    varezTableDeletes: Record<string, number>;
    discordTableDeletes: Record<string, number>;
    clansTouched: number;
    pluginRowDeletes: number;
    clanRowNulls: number;
    socketsClosed: number;
}

export function clanIds(): string[] {
    return selectRows<{ id: string }>(DB_NAMES.APP, `SELECT id FROM clansocket_clans`).map((r) => r.id);
}

export function emptyResult(accountHash: string, siteAccountId: string): PurgeUserResult {
    return {
        accountHash,
        siteAccountId,
        appTableDeletes: {},
        varezTableDeletes: {},
        discordTableDeletes: {},
        clansTouched: 0,
        pluginRowDeletes: 0,
        clanRowNulls: 0,
        socketsClosed: 0,
    };
}
