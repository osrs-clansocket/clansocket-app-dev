import { DISCORD_TRIGGER_MANIFEST, type DiscordTriggerSpec } from "@clansocket/constants/discord-trigger-manifest";
import { registerTrigger } from "../../flows/registries/trigger-registry.js";
import type { FlowFieldList } from "../../flows/registries/payload-field-types.js";

const CAPABILITY = "discord";

const GUILD = {
    name: "guildId",
    type: "discord-guild-id" as const,
    valueSourceRef: "discord-guild-id",
    required: true,
};

const PAYLOAD_BY_KIND: Readonly<Record<DiscordTriggerSpec["payloadKind"], FlowFieldList>> = {
    channel: [
        { name: "id", type: "discord-channel-id", valueSourceRef: "discord-channel-id", required: true },
        { name: "name", type: "string", required: true },
        GUILD,
        { name: "type", type: "channel-type", valueSourceRef: "discord-channel-type", required: true },
        { name: "parent_id", type: "discord-channel-id", valueSourceRef: "discord-channel-id" },
        { name: "nsfw", type: "boolean" },
        { name: "slowmodeSeconds", type: "integer" },
        { name: "topic", type: "string" },
        { name: "archived", type: "boolean" },
    ],
    member: [
        { name: "id", type: "discord-member-id", valueSourceRef: "discord-member-id", required: true },
        { name: "name", type: "string", required: true },
        GUILD,
        { name: "nick", type: "string" },
        { name: "bot", type: "boolean" },
        { name: "joinedAt", type: "timestamp" },
        { name: "premiumSince", type: "timestamp" },
    ],
    role: [
        { name: "id", type: "discord-role-id", valueSourceRef: "discord-role-id", required: true },
        { name: "name", type: "string", required: true },
        GUILD,
        { name: "color", type: "integer" },
    ],
    emoji: [{ name: "id", type: "string", required: true }, { name: "name", type: "string", required: true }, GUILD],
    sticker: [{ name: "id", type: "string", required: true }, { name: "name", type: "string", required: true }, GUILD],
    webhook: [
        GUILD,
        { name: "channelId", type: "discord-channel-id", valueSourceRef: "discord-channel-id", required: true },
    ],
    guild: [
        { name: "id", type: "discord-guild-id", valueSourceRef: "discord-guild-id", required: true },
        { name: "name", type: "string", required: true },
        { name: "ownerId", type: "discord-member-id", valueSourceRef: "discord-member-id" },
        { name: "memberCount", type: "integer" },
    ],
    message: [
        { name: "id", type: "string", required: true },
        { name: "channelId", type: "discord-channel-id", valueSourceRef: "discord-channel-id", required: true },
        GUILD,
        { name: "authorId", type: "discord-member-id", valueSourceRef: "discord-member-id" },
        { name: "content", type: "string" },
        { name: "timestamp", type: "timestamp" },
        { name: "editedAt", type: "timestamp" },
        { name: "pinned", type: "boolean" },
        { name: "mentionCount", type: "integer" },
    ],
    reaction: [
        { name: "messageId", type: "string", required: true },
        { name: "channelId", type: "discord-channel-id", valueSourceRef: "discord-channel-id", required: true },
        GUILD,
        { name: "userId", type: "discord-member-id", valueSourceRef: "discord-member-id", required: true },
        { name: "emoji", type: "string" },
    ],
    thread: [
        { name: "id", type: "discord-channel-id", valueSourceRef: "discord-channel-id", required: true },
        { name: "name", type: "string", required: true },
        GUILD,
        { name: "parentId", type: "discord-channel-id", valueSourceRef: "discord-channel-id" },
    ],
    "voice-state": [
        { name: "userId", type: "discord-member-id", valueSourceRef: "discord-member-id", required: true },
        GUILD,
        { name: "channelId", type: "discord-channel-id", valueSourceRef: "discord-channel-id" },
        { name: "previousChannelId", type: "discord-channel-id", valueSourceRef: "discord-channel-id" },
    ],
    ban: [
        { name: "userId", type: "discord-member-id", valueSourceRef: "discord-member-id", required: true },
        GUILD,
        { name: "reason", type: "string" },
    ],
    interaction: [
        { name: "id", type: "string", required: true },
        { name: "type", type: "string", required: true },
        { name: "userId", type: "discord-member-id", valueSourceRef: "discord-member-id", required: true },
        GUILD,
        { name: "channelId", type: "discord-channel-id", valueSourceRef: "discord-channel-id" },
        { name: "commandName", type: "string" },
        { name: "customId", type: "string" },
    ],
    "scheduled-event": [
        { name: "id", type: "string", required: true },
        { name: "name", type: "string", required: true },
        GUILD,
        { name: "scheduledStartAt", type: "timestamp" },
        { name: "scheduledEndAt", type: "timestamp" },
        { name: "channelId", type: "discord-channel-id", valueSourceRef: "discord-channel-id" },
    ],
};

for (const spec of DISCORD_TRIGGER_MANIFEST) {
    registerTrigger({
        capability: CAPABILITY,
        triggerId: spec.triggerId,
        eventSource: spec.gatewaySource,
        routing: "gateway",
        payloadFields: PAYLOAD_BY_KIND[spec.payloadKind],
    });
}
