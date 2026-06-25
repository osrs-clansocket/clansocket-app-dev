import type Database from "better-sqlite3";
import logger from "@clansocket/logger";
import { DB_NAMES, getDb } from "../../core/database.js";
import { CLANSOCKET_SATURATED } from "../../plugin/saturated-tables.js";

interface SaturatedDef {
    table: string;
    rsnColumn: string;
    hashColumn: string;
}

function prepareRsnUpdate(db: Database.Database, def: SaturatedDef): Database.Statement {
    return db.prepare(`UPDATE ${def.table} SET ${def.rsnColumn} = ? WHERE ${def.hashColumn} = ?`);
}

export function sweepClansocketHash(accountHash: string, newRsn: string): void {
    const db = getDb(DB_NAMES.APP);
    const stmts = CLANSOCKET_SATURATED.map((def) => prepareRsnUpdate(db, def));
    db.transaction(() => {
        logger.debug(`[rsn-sweep-clansocket] accountHash=${accountHash} stmts=${stmts.length}`);
        for (const stmt of stmts) stmt.run(newRsn, accountHash);
    })();
}
