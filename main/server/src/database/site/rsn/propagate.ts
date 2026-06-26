import type Database from "better-sqlite3";
import logger from "@clansocket/logger";
import { DB_NAMES, getClanDb, clanPluginDb, pluginModes } from "../../core/database.js";
import { selectColumns } from "../../../shared/loaders/db-rows.js";
import { CLAN_SATURATED, PLUGIN_SATURATED } from "../../plugin/saturated-tables.js";
import { sweepClansocketHash } from "./sweeper-clansocket.js";

interface SaturatedDef {
    table: string;
    rsnColumn: string;
    hashColumn: string;
}

function prepareRsnUpdate(db: Database.Database, def: SaturatedDef): Database.Statement {
    return db.prepare(`UPDATE ${def.table} SET ${def.rsnColumn} = ? WHERE ${def.hashColumn} = ?`);
}

function runAll(stmts: readonly Database.Statement[], newRsn: string, accountHash: string): void {
    logger.debug(`[rsn-propagate] runAll stmts=${stmts.length}`);
    for (const stmt of stmts) {
        stmt.run(newRsn, accountHash);
    }
}

function activeClanIds(): string[] {
    return selectColumns<string>(
        DB_NAMES.APP,
        `SELECT id FROM clansocket_clans WHERE status = 'active' AND archived_at IS NULL`,
    );
}

function sweepClanDb(clanId: string, accountHash: string, newRsn: string): void {
    const clanDb = getClanDb(clanId);
    const stmts = CLAN_SATURATED.map((def) => prepareRsnUpdate(clanDb, def));
    clanDb.transaction(() => runAll(stmts, newRsn, accountHash))();
}

function sweepPluginDb(clanId: string, mode: string, accountHash: string, newRsn: string): void {
    const pluginDb = clanPluginDb(clanId, mode);
    const stmts = PLUGIN_SATURATED.map((def) => prepareRsnUpdate(pluginDb, def));
    pluginDb.transaction(() => runAll(stmts, newRsn, accountHash))();
}

function sweepByHash(accountHash: string, newRsn: string): void {
    for (const clanId of activeClanIds()) {
        sweepClanDb(clanId, accountHash, newRsn);
        for (const mode of pluginModes(clanId)) {
            sweepPluginDb(clanId, mode, accountHash, newRsn);
        }
    }
}

export function propagateRsnChange(accountHash: string, newRsn: string): void {
    sweepClansocketHash(accountHash, newRsn);
    sweepByHash(accountHash, newRsn);
}
