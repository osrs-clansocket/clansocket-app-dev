import { PLUGIN_ASSET_TABLES } from "../../scopes/manifest/index.js";
import type { ZipEntry } from "../collect-user/index.js";

export type AssetCfg = (typeof PLUGIN_ASSET_TABLES)[number];

interface AssetSummary {
    tables: Record<string, number>;
    assets: number;
}

export function emitAssetRow(
    row: Record<string, unknown>,
    assetCfg: AssetCfg,
    table: string,
    basePath: string,
): ZipEntry | null {
    const blob = row[assetCfg.blobColumn] as Buffer | null | undefined;
    if (!blob || !(blob instanceof Buffer)) return null;
    const id = row[assetCfg.idColumn];
    const ext = assetCfg.extColumn
        ? String(row[assetCfg.extColumn] ?? assetCfg.defaultExt).toLowerCase()
        : assetCfg.defaultExt;
    return { path: `${basePath}/_assets/${table}/${String(id)}.${ext}`, buffer: blob };
}

interface CollectAssetArgs {
    rows: Record<string, unknown>[];
    assetCfg: AssetCfg;
    table: string;
    basePath: string;
    entries: ZipEntry[];
    summary: AssetSummary;
    stripBlobs: (rows: Record<string, unknown>[], blobCols: string[]) => Record<string, unknown>[];
}

export function collectAssetRows(args: CollectAssetArgs): void {
    const { rows, assetCfg, table, basePath, entries, summary, stripBlobs } = args;
    for (const row of rows) {
        const entry = emitAssetRow(row, assetCfg, table, basePath);
        if (entry === null) continue;
        entries.push(entry);
        summary.assets += 1;
    }
    const stripped = stripBlobs(rows, [assetCfg.blobColumn]);
    entries.push({ path: `${basePath}/${table}.json`, json: stripped });
}
