import type Database from "better-sqlite3";
import { sqlPlaceholders } from "../../../core/operations/index.js";

export interface SnapshotPruneArgs {
    conn: Database.Database;
    table: string;
    keyCol: string;
    accountHash: string;
    keepKeys: (string | number)[];
    extraClause?: string;
    extraParams?: (string | number)[];
}

export function snapshotPrune(args: SnapshotPruneArgs): void {
    const { conn, table, keyCol, accountHash, keepKeys, extraClause = "", extraParams = [] } = args;
    if (keepKeys.length === 0) {
        conn.prepare(`DELETE FROM ${table} WHERE account_hash = ?${extraClause}`).run(accountHash, ...extraParams);
        return;
    }
    conn.prepare(
        `DELETE FROM ${table} WHERE account_hash = ?${extraClause} AND ${keyCol} NOT IN (${sqlPlaceholders(keepKeys.length)})`,
    ).run(accountHash, ...extraParams, ...keepKeys);
}
