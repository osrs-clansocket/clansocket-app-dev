import type Database from "better-sqlite3";

export function sqliteEntityExists(db: Database.Database, type: "table" | "index", name: string): boolean {
    const row = db.prepare("SELECT 1 AS one FROM sqlite_master WHERE type = ? AND name = ? LIMIT 1").get(type, name) as
        | { one: number }
        | undefined;
    return row !== undefined;
}

export function tableExists(db: Database.Database, table: string): boolean {
    return sqliteEntityExists(db, "table", table);
}

export function indexExists(db: Database.Database, name: string): boolean {
    return sqliteEntityExists(db, "index", name);
}

export function columnExists(db: Database.Database, table: string, column: string): boolean {
    const rows = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
    return rows.some((r) => r.name === column);
}
