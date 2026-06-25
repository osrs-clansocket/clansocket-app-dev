import { clanPluginDb, pluginModes } from "../../../database/index.js";
import { PLUGIN_ASSET_BY_TABLE, PLUGIN_USER_CHILD_TABLES, PLUGIN_USER_TABLES } from "../../scopes/manifest/index.js";
import { collectAssetRows } from "../collect-common/asset-collection.js";
import { selectAll, stripBlobs } from "./db-select.js";
import type { ClanSummary, ModeSummary, ZipEntry } from "./types.js";

interface CollectModeUser {
    pluginDb: ReturnType<typeof clanPluginDb>;
    accountHash: string;
    entries: ZipEntry[];
    modeSummary: ModeSummary;
    basePath: string;
}

function userTables(args: CollectModeUser): void {
    const { pluginDb, accountHash, entries, modeSummary, basePath } = args;
    for (const { table, column } of PLUGIN_USER_TABLES) {
        const rows = selectAll(pluginDb, table, `${column} = ?`, accountHash);
        if (rows.length === 0) continue;
        const assetCfg = PLUGIN_ASSET_BY_TABLE[table];
        if (assetCfg) {
            collectAssetRows({ rows, assetCfg, table, basePath, entries, stripBlobs, summary: modeSummary });
        } else {
            entries.push({ path: `${basePath}/${table}.json`, json: rows });
        }
        modeSummary.tables[table] = rows.length;
    }
}

type ChildSpec = (typeof PLUGIN_USER_CHILD_TABLES)[number];

function loadChildRows(
    pluginDb: ReturnType<typeof clanPluginDb>,
    accountHash: string,
    child: ChildSpec,
): Record<string, unknown>[] {
    const parent = PLUGIN_USER_TABLES.find((t) => t.table === child.parentTable);
    if (!parent) return [];
    const sql =
        `SELECT child.* FROM ${child.table} AS child` +
        ` JOIN ${child.parentTable} AS p ON p.${child.parentColumn} = child.${child.parentKey}` +
        ` WHERE p.${parent.column} = ?`;
    return pluginDb.prepare(sql).all(accountHash) as Record<string, unknown>[];
}

function childTables(args: CollectModeUser): void {
    const { pluginDb, accountHash, entries, modeSummary, basePath } = args;
    for (const child of PLUGIN_USER_CHILD_TABLES) {
        const rows = loadChildRows(pluginDb, accountHash, child);
        if (rows.length === 0) continue;
        entries.push({ path: `${basePath}/${child.table}.json`, json: rows });
        modeSummary.tables[child.table] = rows.length;
    }
}

interface CollectModeArgs {
    clanId: string;
    mode: string;
    accountHash: string;
    entries: ZipEntry[];
    clanSummary: ClanSummary;
}

function collectMode(args: CollectModeArgs): void {
    const { clanId, mode, accountHash, entries, clanSummary } = args;
    const pluginDb = clanPluginDb(clanId, mode);
    const modeSummary: ModeSummary = { mode, tables: {}, assets: 0 };
    const basePath = `clans/${clanId}/plugin-${mode}.db`;
    const inner = { pluginDb, accountHash, entries, modeSummary, basePath };
    userTables(inner);
    childTables(inner);
    if (Object.keys(modeSummary.tables).length > 0 || modeSummary.assets > 0) {
        clanSummary.modes.push(modeSummary);
    }
}

export function collectPluginModes(
    clanId: string,
    accountHash: string,
    entries: ZipEntry[],
    clanSummary: ClanSummary,
): void {
    for (const mode of pluginModes(clanId)) {
        collectMode({ clanId, mode, accountHash, entries, clanSummary });
    }
}
