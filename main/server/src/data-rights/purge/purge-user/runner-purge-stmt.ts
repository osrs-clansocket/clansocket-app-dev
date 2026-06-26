import type Database from "better-sqlite3";
import type { DeleteBag } from "./purge-stmt-types.js";

export function accumulateTableChanges(bag: DeleteBag, key: string, changes: number): void {
    if (changes > 0) bag[key] = (bag[key] ?? 0) + changes;
}

export function runDeleteStmt(stmt: Database.Statement, key: string, arg: string, bag: DeleteBag): boolean {
    const r = stmt.run(arg);
    if (r.changes === 0) return false;
    accumulateTableChanges(bag, key, r.changes);
    return true;
}
