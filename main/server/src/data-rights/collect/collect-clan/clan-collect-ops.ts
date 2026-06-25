import type Database from "better-sqlite3";

export function tablesInDb(db: Database.Database): string[] {
    const rows = db
        .prepare(
            `SELECT name FROM sqlite_master
             WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_litestream%'
             ORDER BY name`,
        )
        .all() as { name: string }[];
    return rows.map((r) => r.name);
}

export { stripBlobs } from "../collect-common/strip-blobs.js";
