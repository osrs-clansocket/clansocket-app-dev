import { getClanDb, clanPluginDb, pluginModes } from "../../core/clans.js";

export type Resolver = (clanId: string) => readonly string[];

function collectModeDistinct(clanId: string, mode: string, sql: string, into: Set<string>): void {
    const db = clanPluginDb(clanId, mode);
    const rows = db.prepare(sql).all() as { v: unknown }[];
    for (const r of rows) into.add(String(r.v));
}

function distinctPluginTable(table: string, column: string): Resolver {
    const sql = `SELECT DISTINCT "${column}" AS v FROM "${table}" WHERE "${column}" IS NOT NULL AND "${column}" != '' ORDER BY "${column}"`;
    return (clanId: string): readonly string[] => {
        const set = new Set<string>();
        for (const mode of pluginModes(clanId)) {
            collectModeDistinct(clanId, mode, sql, set);
        }
        return [...set].sort((a, b) => a.localeCompare(b));
    };
}

function distinctClanTable(table: string, column: string): Resolver {
    const sql = `SELECT DISTINCT "${column}" AS v FROM "${table}" WHERE "${column}" IS NOT NULL AND "${column}" != '' ORDER BY "${column}"`;
    return (clanId: string): readonly string[] => {
        const db = getClanDb(clanId);
        const rows = db.prepare(sql).all() as { v: unknown }[];
        return rows.map((r) => String(r.v));
    };
}

export const pluginCol =
    (table: string) =>
    (col: string): Resolver =>
        distinctPluginTable(table, col);

export const clanCol =
    (table: string) =>
    (col: string): Resolver =>
        distinctClanTable(table, col);
