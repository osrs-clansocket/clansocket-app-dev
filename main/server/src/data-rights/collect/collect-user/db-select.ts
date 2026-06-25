import type Database from "better-sqlite3";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { clanDirPath } from "../../../database/core/database.js";
import { DB_NAMES, pluginModes } from "../../../database/index.js";
import { selectRows } from "../../../shared/loaders/db-rows.js";
import type { ClanRowLite } from "./types.js";

export function listAllClans(): ClanRowLite[] {
    return selectRows<ClanRowLite>(
        DB_NAMES.APP,
        `SELECT id, slug, display_name, status FROM clansocket_clans ORDER BY created_at`,
    );
}

export function selectAll(
    db: Database.Database,
    table: string,
    where: string,
    ...params: unknown[]
): Record<string, unknown>[] {
    return db.prepare(`SELECT * FROM ${table} WHERE ${where}`).all(...params) as Record<string, unknown>[];
}

export { stripBlobs } from "../collect-common/strip-blobs.js";

export function dirHasDb(clanId: string): boolean {
    const dir = resolve(clanDirPath(clanId), "..");
    if (!existsSync(dir)) return false;
    return pluginModes(clanId).length > 0;
}
