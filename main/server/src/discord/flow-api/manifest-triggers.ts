import type { JSONSchema, TriggerSpec } from "../../flows/registries/registry-types.js";

const GUILD_ID_FIELD: JSONSchema = { type: "string", format: "discord-guild-id" };

const CHANNEL_PAYLOAD: JSONSchema = {
    type: "object",
    required: ["id", "name", "guildId", "type"],
    properties: {
        id: { type: "string" },
        name: { type: "string" },
        guildId: GUILD_ID_FIELD,
        type: { type: "integer" },
        parent_id: { type: "string" },
    },
};

const MEMBER_PAYLOAD: JSONSchema = {
    type: "object",
    required: ["id", "name", "guildId"],
    properties: { id: { type: "string" }, name: { type: "string" }, guildId: GUILD_ID_FIELD },
};

const ROLE_PAYLOAD: JSONSchema = {
    type: "object",
    required: ["id", "name", "guildId"],
    properties: {
        id: { type: "string" },
        name: { type: "string" },
        guildId: GUILD_ID_FIELD,
        color: { type: "integer" },
    },
};

const EMOJI_PAYLOAD: JSONSchema = {
    type: "object",
    required: ["id", "name", "guildId"],
    properties: { id: { type: "string" }, name: { type: "string" }, guildId: GUILD_ID_FIELD },
};

const WEBHOOK_PAYLOAD: JSONSchema = {
    type: "object",
    required: ["guildId", "channelId"],
    properties: { guildId: GUILD_ID_FIELD, channelId: { type: "string" } },
};

const GUILD_PAYLOAD: JSONSchema = {
    type: "object",
    required: ["id", "name", "guildId"],
    properties: { id: { type: "string" }, name: { type: "string" }, guildId: GUILD_ID_FIELD },
};

function trigger(eventSource: string, payload_schema: JSONSchema): TriggerSpec {
    return { event_source: eventSource, payload_schema, triggerable: true };
}

export const TRIGGERS: Readonly<Record<string, TriggerSpec>> = {
    "discord:channels.created": trigger("discord.gateway.channelCreate", CHANNEL_PAYLOAD),
    "discord:channels.updated": trigger("discord.gateway.channelUpdate", CHANNEL_PAYLOAD),
    "discord:channels.deleted": trigger("discord.gateway.channelDelete", CHANNEL_PAYLOAD),
    "discord:members.joined": trigger("discord.gateway.guildMemberAdd", MEMBER_PAYLOAD),
    "discord:members.left": trigger("discord.gateway.guildMemberRemove", MEMBER_PAYLOAD),
    "discord:members.updated": trigger("discord.gateway.guildMemberUpdate", MEMBER_PAYLOAD),
    "discord:roles.created": trigger("discord.gateway.guildRoleCreate", ROLE_PAYLOAD),
    "discord:roles.updated": trigger("discord.gateway.guildRoleUpdate", ROLE_PAYLOAD),
    "discord:roles.deleted": trigger("discord.gateway.guildRoleDelete", ROLE_PAYLOAD),
    "discord:server-emojis.created": trigger("discord.gateway.emojiCreate", EMOJI_PAYLOAD),
    "discord:server-emojis.updated": trigger("discord.gateway.emojiUpdate", EMOJI_PAYLOAD),
    "discord:server-emojis.deleted": trigger("discord.gateway.emojiDelete", EMOJI_PAYLOAD),
    "discord:server-stickers.created": trigger("discord.gateway.stickerCreate", EMOJI_PAYLOAD),
    "discord:server-stickers.updated": trigger("discord.gateway.stickerUpdate", EMOJI_PAYLOAD),
    "discord:server-stickers.deleted": trigger("discord.gateway.stickerDelete", EMOJI_PAYLOAD),
    "discord:webhooks.updated": trigger("discord.gateway.webhooksUpdate", WEBHOOK_PAYLOAD),
    "discord:guild.updated": trigger("discord.gateway.guildUpdate", GUILD_PAYLOAD),
};
