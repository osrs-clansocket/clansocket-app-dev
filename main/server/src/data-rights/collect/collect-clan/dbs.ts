import type Database from "better-sqlite3";
import { clanAuditDb } from "../../../database/core/database.js";
import { getClanDb, clanPluginDb, pluginModes } from "../../../database/index.js";
import { PLUGIN_ASSET_BY_TABLE } from "../../scopes/manifest/index.js";
import { collectAssetRows } from "../collect-common/asset-collection.js";
import type { ZipEntry } from "../collect-user/index.js";
import { tablesInDb, stripBlobs } from "./clan-collect-ops.js";
import { prepareSelectAll, pushJsonRows, type PreparedTableSelect } from "./table-select-builder.js";
import type { ClanCollectionSummary, ModeSummary } from "./types.js";

function collectOneTable(
    s: PreparedTableSelect,
    entries: ZipEntry[],
    pathPrefix: string,
    summaryBucket: Record<string, number>,
): void {
    const rows = s.stmt.all() as Record<string, unknown>[];
    pushJsonRows({ rows, entries, path: `${pathPrefix}/${s.table}.json`, bucket: summaryBucket, table: s.table });
}

export function collectClanDb(clanId: string, entries: ZipEntry[], summary: ClanCollectionSummary): void {
    const clanDb = getClanDb(clanId);
    const stmts = tablesInDb(clanDb).map((table) => prepareSelectAll(clanDb, table));
    for (const s of stmts) {
        collectOneTable(s, entries, `clans/${clanId}/clan.db`, summary.clanDbTables);
    }
}

export function collectClanAudit(clanId: string, entries: ZipEntry[], summary: ClanCollectionSummary): void {
    const auditDb = clanAuditDb(clanId);
    const stmts = tablesInDb(auditDb).map((table) => prepareSelectAll(auditDb, table));
    for (const s of stmts) {
        collectOneTable(s, entries, `clans/${clanId}/clan_audit.db`, summary.clanAuditDbTables);
    }
}

function collectPluginTable(
    s: PreparedTableSelect,
    entries: ZipEntry[],
    basePath: string,
    modeSummary: ModeSummary,
): void {
    const assetCfg = PLUGIN_ASSET_BY_TABLE[s.table];
    const rows = s.stmt.all() as Record<string, unknown>[];
    if (rows.length === 0) return;
    if (assetCfg) {
        collectAssetRows({ rows, assetCfg, basePath, entries, stripBlobs, table: s.table, summary: modeSummary });
    } else {
        entries.push({ path: `${basePath}/${s.table}.json`, json: rows });
    }
    modeSummary.tables[s.table] = rows.length;
}

function collectPluginMode(
    clanId: string,
    mode: string,
    pluginDb: Database.Database,
    entries: ZipEntry[],
): ModeSummary {
    const modeSummary: ModeSummary = { mode, tables: {}, assets: 0 };
    const basePath = `clans/${clanId}/plugin-${mode}.db`;
    const stmts = tablesInDb(pluginDb).map((table) => prepareSelectAll(pluginDb, table));
    for (const s of stmts) collectPluginTable(s, entries, basePath, modeSummary);
    return modeSummary;
}

function collectOneMode(clanId: string, mode: string, entries: ZipEntry[], summary: ClanCollectionSummary): void {
    const pluginDb = clanPluginDb(clanId, mode);
    const modeSummary = collectPluginMode(clanId, mode, pluginDb, entries);
    if (Object.keys(modeSummary.tables).length > 0 || modeSummary.assets > 0) {
        summary.modes.push(modeSummary);
    }
}

export function collectPluginModes(clanId: string, entries: ZipEntry[], summary: ClanCollectionSummary): void {
    for (const mode of pluginModes(clanId)) {
        collectOneMode(clanId, mode, entries, summary);
    }
}
