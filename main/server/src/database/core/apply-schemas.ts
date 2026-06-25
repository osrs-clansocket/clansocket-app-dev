import type Database from "better-sqlite3";
import { existsSync, readFileSync, readdirSync } from "fs";
import { resolve } from "path";
import { schemasDir } from "./db-paths.js";

export function applySchemas(db: Database.Database, schemaKey: string): void {
    const dir = schemasDir(schemaKey);
    if (!existsSync(dir)) return;
    const files = readdirSync(dir)
        .filter((f) => f.endsWith(".sql"))
        .sort();
    for (const file of files) {
        db.exec(readFileSync(resolve(dir, file), "utf-8"));
    }
}
