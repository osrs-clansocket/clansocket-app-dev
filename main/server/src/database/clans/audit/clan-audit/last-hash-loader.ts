import type Database from "better-sqlite3";

export function getLastHash(db: Database.Database): string | null {
    const row = db.prepare("SELECT row_hash FROM clan_audit_log ORDER BY id DESC LIMIT 1").get() as
        | { row_hash: string }
        | undefined;
    return row?.row_hash ?? null;
}
