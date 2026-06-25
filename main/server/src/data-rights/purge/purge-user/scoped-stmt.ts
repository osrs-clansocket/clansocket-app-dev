import type Database from "better-sqlite3";

export interface ScopedDef {
    table: string;
    column: string;
    action: "null" | "delete";
}

export function prepareScopedStmt(db: Database.Database, def: ScopedDef): { stmt: Database.Statement } {
    return {
        stmt: db.prepare(
            def.action === "null"
                ? `UPDATE ${def.table} SET ${def.column} = NULL WHERE ${def.column} = ?`
                : `DELETE FROM ${def.table} WHERE ${def.column} = ?`,
        ),
    };
}
