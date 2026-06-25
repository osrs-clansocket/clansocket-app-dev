import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { clanDirPath } from "../../../database/core/database.js";
import { DB_NAMES, getDb } from "../../../database/index.js";
import type { ZipEntry } from "../collect-user/index.js";
import { collectClanAudit, collectClanDb, collectPluginModes } from "./dbs.js";
import { collectClanIcons } from "./icons.js";
import { prepareWhereSelect, pushJsonRows, type PreparedTableSelect } from "./table-select-builder.js";
import { APP_TABLES_BY_CLAN_ID, type ClanCollectionSummary } from "./types.js";

interface ClanRow {
    id: string;
    slug: string;
    display_name: string;
    status: string;
    icon_kind: string | null;
    icon_value: string | null;
}

function runAppSelect(
    s: PreparedTableSelect,
    clanId: string,
    entries: ZipEntry[],
    bucket: Record<string, number>,
): void {
    const rows = s.stmt.all(clanId) as Record<string, unknown>[];
    pushJsonRows({ rows, entries, bucket, path: `clansocket.db/${s.table}.json`, table: s.table });
}

function loadClanRow(clanId: string): ClanRow | undefined {
    return getDb(DB_NAMES.APP)
        .prepare(
            `SELECT id, slug, display_name, status, icon_kind, icon_value
             FROM clansocket_clans WHERE id = ?`,
        )
        .get(clanId) as ClanRow | undefined;
}

function emptySummary(clan: ClanRow): ClanCollectionSummary {
    return {
        clanId: clan.id,
        displayName: clan.display_name,
        slug: clan.slug,
        status: clan.status,
        exportedAt: Date.now(),
        appTables: {},
        clanDbTables: {},
        clanAuditDbTables: {},
        modes: [],
        icon: null,
    };
}

function collectAppTables(clanId: string, entries: ZipEntry[], summary: ClanCollectionSummary): void {
    const appDb = getDb(DB_NAMES.APP);
    const appStmts = APP_TABLES_BY_CLAN_ID.map(({ table, column }) => prepareWhereSelect(appDb, table, column));
    for (const s of appStmts) runAppSelect(s, clanId, entries, summary.appTables);
}

function hasClanDb(clanDir: string, name: string): boolean {
    return existsSync(resolve(clanDir, name));
}

function collectClanFiles(clanId: string, clan: ClanRow, entries: ZipEntry[], summary: ClanCollectionSummary): void {
    const clanDir = clanDirPath(clanId);
    if (clan.icon_kind === "image") collectClanIcons(clanId, clanDir, entries, summary);
    if (hasClanDb(clanDir, "clan.db")) collectClanDb(clanId, entries, summary);
    if (hasClanDb(clanDir, "clan_audit.db")) collectClanAudit(clanId, entries, summary);
    collectPluginModes(clanId, entries, summary);
}

export type { ClanCollectionSummary } from "./types.js";

export function collectClanData(clanId: string): { entries: ZipEntry[]; summary: ClanCollectionSummary } | null {
    const clan = loadClanRow(clanId);
    if (!clan) return null;
    const entries: ZipEntry[] = [];
    const summary = emptySummary(clan);
    collectAppTables(clanId, entries, summary);
    collectClanFiles(clanId, clan, entries, summary);
    entries.unshift({ path: "manifest.json", json: summary });
    return { entries, summary };
}
