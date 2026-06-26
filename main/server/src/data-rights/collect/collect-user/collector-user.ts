import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { clanDirPath } from "../../../database/core/database.js";
import { guildIdsOf } from "../../discord-guild-iterator.js";
import { collectAuditTables, collectClanTables, collectGuildTables } from "./clan-tables.js";
import { listAllClans, dirHasDb } from "./db-select.js";
import { collectPluginModes } from "./plugin-tables.js";
import { collectAppTables, collectBotTables } from "./top-level.js";
import type { ClanSummary, UserCollectionSummary, ZipEntry } from "./types.js";

interface ClanPresence {
    hasClanDb: boolean;
    hasAuditDb: boolean;
    hasAnyPlugin: boolean;
    hasDiscordGuilds: boolean;
}

function detectClanPresence(clanId: string): ClanPresence {
    const clanDir = clanDirPath(clanId);
    return {
        hasClanDb: existsSync(resolve(clanDir, "clan.db")),
        hasAuditDb: existsSync(resolve(clanDir, "clan_audit.db")),
        hasAnyPlugin: dirHasDb(clanId),
        hasDiscordGuilds: guildIdsOf(clanId).length > 0,
    };
}

function presenceEmpty(p: ClanPresence): boolean {
    return !p.hasClanDb && !p.hasAuditDb && !p.hasAnyPlugin && !p.hasDiscordGuilds;
}

interface CollectClanArgs {
    clan: ReturnType<typeof listAllClans>[number];
    accountHash: string;
    siteAccountId: string;
    entries: ZipEntry[];
    summary: UserCollectionSummary;
}

function collectClan(args: CollectClanArgs): void {
    const { clan, accountHash, siteAccountId, entries, summary } = args;
    const presence = detectClanPresence(clan.id);
    if (presenceEmpty(presence)) return;
    const clanSummary: ClanSummary = {
        clanId: clan.id,
        displayName: clan.display_name,
        slug: clan.slug,
        status: clan.status,
        clanDbTables: {},
        modes: [],
    };
    if (presence.hasClanDb) collectClanTables({ clanId: clan.id, accountHash, siteAccountId, entries, clanSummary });
    if (presence.hasAuditDb) collectAuditTables(clan.id, siteAccountId, entries, clanSummary);
    if (presence.hasDiscordGuilds) collectGuildTables(clan.id, siteAccountId, entries, clanSummary);
    collectPluginModes(clan.id, accountHash, entries, clanSummary);
    if (Object.keys(clanSummary.clanDbTables).length > 0 || clanSummary.modes.length > 0) {
        summary.clans.push(clanSummary);
    }
}

export function collectUserData(
    accountHash: string,
    siteAccountId: string,
): { entries: ZipEntry[]; summary: UserCollectionSummary } {
    const entries: ZipEntry[] = [];
    const summary: UserCollectionSummary = {
        accountHash,
        siteAccountId,
        exportedAt: Date.now(),
        appTables: {},
        discordTables: {},
        clans: [],
    };
    collectAppTables(accountHash, siteAccountId, entries, summary);
    collectBotTables(siteAccountId, entries, summary);
    for (const clan of listAllClans()) collectClan({ clan, accountHash, siteAccountId, entries, summary });
    entries.unshift({ path: `manifest.json`, json: summary });
    return { entries, summary };
}
