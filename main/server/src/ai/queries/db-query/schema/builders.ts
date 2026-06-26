import {
    getClanDb,
    clanPluginDb,
    getDb,
    getStaticDb,
    pluginModes,
    PLUGIN_DB_PREFIX,
    STATIC_DB_NAMES,
} from "../../../../database/index.js";
import { CHAIN_DB, CHAIN_VIEW, CLAN_DB } from "../types.js";
import { CLAN_PURPOSE_NOTE, DB_PURPOSE, PLUGIN_PURPOSE_NOTE } from "./purpose.js";
import { appendTableCols } from "./table-appender.js";
import { listTables } from "./lister-tables.js";

const STATIC_CATALOG_DBS = new Set<string>(Object.values(STATIC_DB_NAMES));

export function tryAppendClan(lines: string[], clanId: string, clanSlug: string): void {
    try {
        const db = getClanDb(clanId);
        lines.push(`[${CLAN_DB} clan=${clanSlug}] — ${CLAN_PURPOSE_NOTE}`);
        for (const t of listTables(db)) appendTableCols(lines, db, t.name);
        lines.push("");
    } catch {
        lines.push(`[${CLAN_DB} clan=${clanSlug}] (not initialized)`);
        lines.push("");
    }
}

function appendOneMode(lines: string[], clanId: string, mode: string, clanSlug: string): void {
    const dbName = `${PLUGIN_DB_PREFIX}${mode}`;
    try {
        const db = clanPluginDb(clanId, mode);
        lines.push(`[${dbName} clan=${clanSlug}] — ${PLUGIN_PURPOSE_NOTE}`);
        for (const t of listTables(db)) appendTableCols(lines, db, t.name);
        lines.push("");
    } catch (err) {
        void err;
        lines.push(`[${dbName} clan=${clanSlug}] (not initialized)`);
        lines.push("");
    }
}

export function tryAppendPlugin(lines: string[], clanId: string, clanSlug: string): void {
    for (const mode of pluginModes(clanId)) {
        appendOneMode(lines, clanId, mode, clanSlug);
    }
}

export function tryAppendStatic(lines: string[], dbName: string): void {
    if (dbName === CHAIN_DB) {
        lines.push(`[${CHAIN_DB}] — ${DB_PURPOSE[CHAIN_DB]}`);
        lines.push(
            `  ${CHAIN_VIEW}: chain_id TEXT, step INTEGER, mode TEXT, loaded_context TEXT, reads TEXT, queries TEXT, recap TEXT, started_at INTEGER, completed_at INTEGER`,
        );
        lines.push("");
        return;
    }
    try {
        const db = STATIC_CATALOG_DBS.has(dbName) ? getStaticDb(dbName) : getDb(dbName);
        lines.push(`[${dbName}] — ${DB_PURPOSE[dbName] ?? ""}`);
        for (const t of listTables(db)) appendTableCols(lines, db, t.name);
        lines.push("");
    } catch {
        lines.push(`[${dbName}] (not initialized)`);
        lines.push("");
    }
}
