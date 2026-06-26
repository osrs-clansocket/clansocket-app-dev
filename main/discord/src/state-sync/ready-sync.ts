import logger from "@clansocket/logger";
import { STATE_KINDS } from "../core/constants.js";
import type { Client, Guild } from "discord.js";
import { loadBotServers } from "../loaders/bot-servers-loader.js";
import type { BotIdentity } from "../shared/types/bot-types.js";
import { autoBindServer } from "./auto-bind.js";
import { extractChannelRow } from "./channels/extract.js";
import { postServerFeatures } from "./features/post-features.js";
import { extractSettingsRow } from "./guild-settings/extract.js";
import { upsertSettings } from "./guild-settings/post-upsert.js";
import { extractMemberRow } from "./members/extract.js";
import { syncAllOverwrites, syncAllPins, syncAllWebhooks } from "./per-channel-sync.js";
import { bulkReplace } from "./post-bulk-replace.js";
import { extractRoleRow } from "./roles/extract.js";
import { extractEmojiRow } from "./server-emojis/extract.js";
import { extractStickerRow } from "./server-stickers/extract.js";
import type { ChannelRow, MemberRow } from "./types.js";

async function collectMembers(guild: Guild): Promise<MemberRow[]> {
    try {
        const members = await guild.members.fetch();
        return [...members.values()].map(extractMemberRow);
    } catch (err) {
        logger.warn(`members fetch failed for guild ${guild.id}: ${(err as Error).message}`);
        return [];
    }
}

function addCachedChannels(channelsById: Map<string, ChannelRow>, guild: Guild): void {
    for (const channel of guild.channels.cache.values()) {
        const row = extractChannelRow(channel);
        if (row) channelsById.set(row.channel_id, row);
    }
}

async function addActiveThreads(channelsById: Map<string, ChannelRow>, guildId: string, guild: Guild): Promise<void> {
    try {
        const active = await guild.channels.fetchActiveThreads();
        for (const thread of active.threads.values()) {
            const row = extractChannelRow(thread);
            if (row) channelsById.set(row.channel_id, row);
        }
    } catch (err) {
        logger.warn(`active threads fetch failed for guild ${guildId}: ${(err as Error).message}`);
    }
}

async function addChannelArchived(channelsById: Map<string, ChannelRow>, channel: any): Promise<void> {
    try {
        const archived = await channel.threads.fetchArchived();
        for (const thread of archived.threads.values()) {
            const row = extractChannelRow(thread);
            if (row) channelsById.set(row.channel_id, row);
        }
    } catch (err) {
        logger.warn(`archived threads fetch failed for channel ${channel.id}: ${(err as Error).message}`);
    }
}

async function syncArchivedThreads(channelsById: Map<string, ChannelRow>, guild: Guild): Promise<void> {
    for (const channel of guild.channels.cache.values()) {
        if (!("threads" in channel) || channel.threads === undefined) continue;
        await addChannelArchived(channelsById, channel);
    }
}

async function collectChannelRows(guildId: string, guild: Guild): Promise<ChannelRow[]> {
    const channelsById = new Map<string, ChannelRow>();
    addCachedChannels(channelsById, guild);
    await addActiveThreads(channelsById, guildId, guild);
    await syncArchivedThreads(channelsById, guild);
    return [...channelsById.values()];
}

export async function syncOneGuild(
    guildId: string,
    guild: Guild,
    botId: string,
    botName: string | null,
): Promise<void> {
    const channels = await collectChannelRows(guildId, guild);
    const roles = [...guild.roles.cache.values()].map(extractRoleRow);
    const members = await collectMembers(guild);
    await bulkReplace(STATE_KINDS.CHANNELS, guildId, channels);
    await bulkReplace(STATE_KINDS.ROLES, guildId, roles);
    await bulkReplace(STATE_KINDS.MEMBERS, guildId, members);
    await postServerFeatures(guildId, [...guild.features]);
    await syncAllWebhooks(guildId, guild, botId, botName);
    await bulkReplace(STATE_KINDS.SERVER_EMOJIS, guildId, [...guild.emojis.cache.values()].map(extractEmojiRow));
    await bulkReplace(STATE_KINDS.SERVER_STICKERS, guildId, [...guild.stickers.cache.values()].map(extractStickerRow));
    const settings = await extractSettingsRow(guild);
    await upsertSettings(guildId, settings);
    await syncAllOverwrites(guildId, guild);
    await syncAllPins(guildId, guild);
}

export async function syncChannelsRoles(identity: BotIdentity, client: Client): Promise<void> {
    const servers = await loadBotServers(identity.bot_id);
    if (servers.length === 0) return;
    for (const server of servers) {
        const guild = client.guilds.cache.get(server.guild_id);
        if (!guild) continue;
        await syncOneGuild(server.guild_id, guild, identity.bot_id, identity.bot_name);
    }
    logger.info(`State synced for ${servers.length} guild(s) (bot=${identity.bot_id})`);
}

export async function backfillUnboundGuilds(identity: BotIdentity, client: Client): Promise<void> {
    const servers = await loadBotServers(identity.bot_id);
    const boundIds = new Set(servers.map((s) => s.guild_id));
    const cached = [...client.guilds.cache.values()];
    let bound = 0;
    for (const guild of cached) {
        if (boundIds.has(guild.id)) continue;
        try {
            await autoBindServer(identity.bot_id, guild.id, guild.name);
            bound += 1;
        } catch (err) {
            logger.warn(`backfill auto-bind failed bot=${identity.bot_id} guild=${guild.id}: ${(err as Error).message}`);
        }
    }
    if (bound > 0) {
        logger.info(`Backfilled ${bound} pre-existing guild binding(s) for bot=${identity.bot_id}`);
    }
}
