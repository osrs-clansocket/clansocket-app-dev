import type Database from "better-sqlite3";
import { wasWritten } from "../../database/core/operations.js";
import { broadcastDbWrite } from "./writes-stream.js";
import { extractWrite, type WriteSig } from "./sql-write-parser.js";

export type { WriteSig } from "./sql-write-parser.js";
export { extractWrite } from "./sql-write-parser.js";

interface RunResultLike {
    changes: number;
}

interface PreparedStmtLike {
    run: (...args: unknown[]) => RunResultLike;
}

function wrapStmtRun(stmt: unknown, sig: WriteSig, scopeKey: string): void {
    const s = stmt as PreparedStmtLike;
    const origRun = s.run.bind(s);
    s.run = (...args: unknown[]): RunResultLike => {
        const res = origRun(...args);
        if (wasWritten(res)) broadcastDbWrite(scopeKey, sig.table, sig.kind);
        return res;
    };
}

export function wrapDbWrites(db: Database.Database, scopeKey: string): void {
    const target = db as unknown as { prepare: (sql: string) => unknown };
    const origPrepare = target.prepare.bind(db);
    target.prepare = (sql: string): unknown => {
        const stmt = origPrepare(sql);
        const sig = extractWrite(sql);
        if (sig) wrapStmtRun(stmt, sig, scopeKey);
        return stmt;
    };
}
