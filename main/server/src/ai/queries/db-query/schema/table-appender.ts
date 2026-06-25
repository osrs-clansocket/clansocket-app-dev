import { getDb } from "../../../../database/index.js";
import { DB_SEMANTICS } from "./db-semantics-loader.js";

type Db = ReturnType<typeof getDb>;
interface PragmaCol {
    name: string;
    type: string;
}

export function listTables(db: Db): { name: string }[] {
    return db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
        .all() as { name: string }[];
}

export function appendTableCols(lines: string[], db: Db, tableName: string): void {
    const cols = db.prepare(`PRAGMA table_info(${tableName})`).all() as PragmaCol[];
    const colsRendered = cols.map((c) => `${c.name} ${c.type}`).join(", ");
    lines.push(`  ${tableName}: ${colsRendered}`);
    const sem = DB_SEMANTICS[tableName];
    if (sem) {
        const noted = cols.filter((c) => sem[c.name]).map((c) => `${c.name} (${sem[c.name]})`);
        if (noted.length > 0) lines.push(`    semantics: ${noted.join("; ")}`);
    }
}
