import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { DB_NAMES, getClanDb, clanPluginDb, getDb, pluginModes } from "../../../database/index.js";
import { clanDirPath, clanAuditDb } from "../../../database/core/database.js";
import { sqlPlaceholders } from "../../../database/core/operations/index.js";
import { CLAN_AUDIT_DB_FILE } from "../../../database/core/db-constants.js";
import type { ClanPresence, ClanRow } from "./types.js";

export function hasPluginRows(clanId: string, mode: string, hashes: readonly string[]): boolean {
    if (hashes.length === 0) return false;
    const row = clanPluginDb(clanId, mode)
        .prepare(`SELECT 1 FROM plugin_sessions WHERE account_hash IN (${sqlPlaceholders(hashes.length)}) LIMIT 1`)
        .get(...hashes);
    return Boolean(row);
}

export function touchesClan(clanId: string, _siteAccountId: string, hashes: readonly string[]): boolean {
    if (hashes.length === 0) return false;
    const db = getClanDb(clanId);
    const r = db
        .prepare(
            `SELECT 1 FROM clan_rosters WHERE captured_by_account_hash IN (${sqlPlaceholders(hashes.length)}) LIMIT 1`,
        )
        .get(...hashes);
    return Boolean(r);
}

export function touchesAudit(clanId: string, siteAccountId: string): boolean {
    const r = clanAuditDb(clanId)
        .prepare(`SELECT 1 FROM clan_audit_log WHERE actor_site_account_id = ? LIMIT 1`)
        .get(siteAccountId);
    return Boolean(r);
}

export function clansUserPresence(siteAccountId: string, hashes: readonly string[]): ClanPresence[] {
    const clans = getDb(DB_NAMES.APP)
        .prepare(`SELECT id, slug, display_name FROM clansocket_clans WHERE archived_at IS NULL`)
        .all() as ClanRow[];
    const out: ClanPresence[] = [];
    for (const clan of clans) {
        const dir = clanDirPath(clan.id);
        const hasClan = existsSync(resolve(dir, "clan.db")) && touchesClan(clan.id, siteAccountId, hashes);
        const hasAudit = existsSync(resolve(dir, CLAN_AUDIT_DB_FILE)) && touchesAudit(clan.id, siteAccountId);
        const presentModes = pluginModes(clan.id).filter((m) => hasPluginRows(clan.id, m, hashes));
        if (!hasClan && !hasAudit && presentModes.length === 0) continue;
        out.push({ clan, presentModes, hasClanDb: hasClan, hasAuditDb: hasAudit });
    }
    return out;
}
