import type Database from "better-sqlite3";

export function pragmaTableInfo(
    db: Database.Database,
    table: string,
): Array<{ name: string; type: string; notnull: number; dflt_value: unknown; pk: number }> {
    return db.prepare(`PRAGMA table_info(${table})`).all() as Array<{
        name: string;
        type: string;
        notnull: number;
        dflt_value: unknown;
        pk: number;
    }>;
}
