import type { getDb } from "../../../../database/index.js";

type Db = ReturnType<typeof getDb>;

export function listTables(db: Db): { name: string }[] {
    return db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
        .all() as { name: string }[];
}
