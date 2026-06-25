import logger from "@clansocket/logger";
import { clanPluginDb } from "../../core/database.js";

export interface SaturateArgs<R> {
    clanId: string;
    mode: string;
    rows: readonly R[];
    sql: string;
    label: string;
    mapRow: (row: R, now: number) => Record<string, unknown>;
}

export function runSaturate<R>(a: SaturateArgs<R>): number {
    if (a.rows.length === 0) return 0;
    const db = clanPluginDb(a.clanId, a.mode);
    const stmt = db.prepare(a.sql);
    const now = Date.now();
    db.transaction(() => {
        logger.debug(`[wom-${a.label}] saturate clanId=${a.clanId} mode=${a.mode} rows=${a.rows.length}`);
        for (const row of a.rows) stmt.run(a.mapRow(row, now));
    })();
    return a.rows.length;
}
