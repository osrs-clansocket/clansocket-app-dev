import { discordGuildDb } from "../../database/discord/discord.js";
import { listByClan } from "../../database/discord/servers/list-by-clan.js";
import type { DataSourceAdapter, DataSourceItem } from "../../flows/registries/registry-types.js";

interface ChannelRow {
    id: string;
    name: string;
    type: number;
}

interface MemberRow {
    user_id: string;
    name: string;
    display_name: string | null;
}

interface RoleRow {
    role_id: string;
    name: string;
}

interface WebhookRow {
    webhook_id: string;
    name: string | null;
    channel_id: string;
}

function listGuildsForClan(clanId: string): readonly string[] {
    return listByClan(clanId).map((row) => row.guild_id);
}

function listChannelsForClan(clanId: string): readonly DataSourceItem[] {
    const items: DataSourceItem[] = [];
    for (const guildId of listGuildsForClan(clanId)) {
        const db = discordGuildDb(clanId, guildId);
        const rows = db.prepare("SELECT id, name, type FROM discord_channels").all() as ChannelRow[];
        for (const row of rows) items.push({ id: row.id, name: row.name, kind: String(row.type) });
    }
    return items;
}

function listMembersForClan(clanId: string): readonly DataSourceItem[] {
    const items: DataSourceItem[] = [];
    for (const guildId of listGuildsForClan(clanId)) {
        const db = discordGuildDb(clanId, guildId);
        const rows = db
            .prepare("SELECT user_id, name, display_name FROM discord_members WHERE is_bot = 0 ORDER BY name")
            .all() as MemberRow[];
        for (const row of rows) items.push({ id: row.user_id, name: row.display_name ?? row.name });
    }
    return items;
}

function listRolesForClan(clanId: string): readonly DataSourceItem[] {
    const items: DataSourceItem[] = [];
    for (const guildId of listGuildsForClan(clanId)) {
        const db = discordGuildDb(clanId, guildId);
        const rows = db
            .prepare("SELECT role_id, name FROM discord_roles WHERE managed = 0 ORDER BY position DESC")
            .all() as RoleRow[];
        for (const row of rows) items.push({ id: row.role_id, name: row.name });
    }
    return items;
}

function listWebhooksForClan(clanId: string): readonly DataSourceItem[] {
    const items: DataSourceItem[] = [];
    for (const guildId of listGuildsForClan(clanId)) {
        const db = discordGuildDb(clanId, guildId);
        const rows = db
            .prepare("SELECT webhook_id, name, channel_id FROM discord_webhooks ORDER BY name")
            .all() as WebhookRow[];
        for (const row of rows) items.push({ id: row.webhook_id, name: row.name ?? row.webhook_id });
    }
    return items;
}

function listGuildsForClanItems(clanId: string): readonly DataSourceItem[] {
    return listByClan(clanId).map((row) => ({ id: row.guild_id, name: row.guild_id }));
}

export const DATA_SOURCES: Readonly<Record<string, DataSourceAdapter>> = {
    channels: { id: "channels", label: "Discord channels", fetch: async (clanId) => listChannelsForClan(clanId) },
    members: { id: "members", label: "Discord members", fetch: async (clanId) => listMembersForClan(clanId) },
    roles: { id: "roles", label: "Discord roles", fetch: async (clanId) => listRolesForClan(clanId) },
    guilds: { id: "guilds", label: "Discord guilds", fetch: async (clanId) => listGuildsForClanItems(clanId) },
    webhooks: { id: "webhooks", label: "Discord webhooks", fetch: async (clanId) => listWebhooksForClan(clanId) },
};
