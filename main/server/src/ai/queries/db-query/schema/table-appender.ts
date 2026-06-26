import type { getDb } from "../../../../database/index.js";
import { DB_SEMANTICS } from "./db-semantics-loader.js";

export function appendTableCols(lines: string[], db: ReturnType<typeof getDb>, tableName: string): void {
    const cols = db.prepare(`PRAGMA table_info(${tableName})`).all() as { name: string; type: string }[];
    const colsRendered = cols.map((c) => `${c.name} ${c.type}`).join(", ");
    lines.push(`  ${tableName}: ${colsRendered}`);
    const sem = DB_SEMANTICS[tableName];
    if (sem) {
        const noted = cols.filter((c) => sem[c.name]).map((c) => `${c.name} (${sem[c.name]})`);
        if (noted.length > 0) lines.push(`    semantics: ${noted.join("; ")}`);
    }
}
