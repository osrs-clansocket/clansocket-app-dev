import { registerValueSource } from "../../registries/value-source-registry.js";
import { getClanDb, clanPluginDb, pluginModes } from "../../../database/core/clans.js";

interface DistinctRow {
    v: unknown;
}

function distinctFromClan(table: string, column: string): (clanId: string) => Promise<readonly { id: string; name: string }[]> {
    const sql = `SELECT DISTINCT "${column}" AS v FROM "${table}" WHERE "${column}" IS NOT NULL AND "${column}" != '' ORDER BY "${column}"`;
    return async (clanId: string) => {
        const db = getClanDb(clanId);
        const rows = db.prepare(sql).all() as DistinctRow[];
        return rows.map((r) => {
            const v = String(r.v);
            return { id: v, name: v };
        });
    };
}

function distinctAcrossPluginModes(table: string, column: string): (clanId: string) => Promise<readonly { id: string; name: string }[]> {
    const sql = `SELECT DISTINCT "${column}" AS v FROM "${table}" WHERE "${column}" IS NOT NULL AND "${column}" != '' ORDER BY "${column}"`;
    return async (clanId: string) => {
        const set = new Set<string>();
        for (const mode of pluginModes(clanId)) {
            const db = clanPluginDb(clanId, mode);
            const rows = db.prepare(sql).all() as DistinctRow[];
            for (const r of rows) set.add(String(r.v));
        }
        return [...set].sort((a, b) => a.localeCompare(b)).map((v) => ({ id: v, name: v }));
    };
}

registerValueSource({
    format: "account-type",
    label: "Account type",
    fetch: distinctFromClan("clan_accounts", "account_type"),
});

registerValueSource({
    format: "region-id",
    label: "World region id (observed)",
    fetch: distinctAcrossPluginModes("plugin_deaths", "region_id"),
});

registerValueSource({
    format: "region-name",
    label: "World region name (observed)",
    fetch: distinctAcrossPluginModes("plugin_deaths", "region_name"),
});

registerValueSource({
    format: "area",
    label: "Area (observed)",
    fetch: distinctAcrossPluginModes("plugin_deaths", "area"),
});
