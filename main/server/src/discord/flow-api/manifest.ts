import { enqueueOutboundEvent } from "../../database/discord/outbound/enqueue.js";
import { discordGuildDb } from "../../database/discord/discord.js";
import type {
    CapabilityManifest,
    DataSourceAdapter,
    DataSourceItem,
    JSONSchema,
    OperationContext,
    OperationResult,
    OperationSpec,
    TriggerSpec,
} from "../../flows/registries/registry-types.js";

const CAPABILITY_NAME = "discord";
const CAPABILITY_COLOR = "blurple";
const TARGET_KIND_CHANNEL = "channel";

const CHANNEL_CREATE_INPUT_SCHEMA: JSONSchema = {
    type: "object",
    required: ["guildId", "name", "type"],
    additionalProperties: false,
    properties: {
        guildId: { type: "string" },
        name: { type: "string", minLength: 1, maxLength: 100 },
        type: { type: "integer" },
        topic: { type: "string", maxLength: 1024 },
        bitrate: { type: "integer" },
        user_limit: { type: "integer" },
        position: { type: "integer" },
        parent_id: { type: "string" },
        nsfw: { type: "boolean" },
        rate_limit_per_user: { type: "integer" },
    },
};

const ENQUEUE_RESULT_SCHEMA: JSONSchema = {
    type: "object",
    required: ["queueId"],
    properties: {
        queueId: { type: "string" },
    },
};

const CHANNEL_TRIGGER_PAYLOAD_SCHEMA: JSONSchema = {
    type: "object",
    required: ["id", "name", "guildId", "type"],
    properties: {
        id: { type: "string" },
        name: { type: "string" },
        guildId: { type: "string" },
        type: { type: "integer" },
        parent_id: { type: "string" },
    },
};

function readString(input: Readonly<Record<string, unknown>>, key: string): string {
    const value = input[key];
    if (typeof value !== "string" || value.length === 0) {
        throw new Error(`discord operation: missing required string "${key}"`);
    }
    return value;
}

function requireBotId(ctx: OperationContext): string {
    if (!ctx.botId) throw new Error("discord operation: ctx.botId required");
    return ctx.botId;
}

async function channelCreateHandler(
    input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
): Promise<OperationResult> {
    const guildId = readString(input, "guildId");
    const name = readString(input, "name");
    const botId = requireBotId(ctx);
    const queueId = enqueueOutboundEvent({
        botId,
        guildId,
        clanId: ctx.clanId,
        targetKind: TARGET_KIND_CHANNEL,
        targetName: name,
        payload: input,
        flowIdOrigin: ctx.flowId,
        flowName: ctx.flowName,
        flowVersion: String(ctx.flowVersion),
    });
    return { result_class: "sent", outputs: { queueId } };
}

const channelOpResultClasses: readonly string[] = [
    "sent",
    "rate_limit",
    "permission_denied",
    "channel_not_found",
    "bot_missing_in_guild",
];

const channelCreateOp: OperationSpec = {
    input_schema: CHANNEL_CREATE_INPUT_SCHEMA,
    output_schema: ENQUEUE_RESULT_SCHEMA,
    side_effects: {
        writes_outbound: true,
        writes_audit: true,
        rate_limit_route: "/guilds/:id/channels",
        emits: ["discord:channels.created"],
    },
    validation: {
        bot_permission: "ManageChannels",
        clansocket_permission: "discord:channels.create",
    },
    result_classes: channelOpResultClasses,
    handler: channelCreateHandler,
};

function channelTrigger(eventSource: string): TriggerSpec {
    return {
        event_source: eventSource,
        payload_schema: CHANNEL_TRIGGER_PAYLOAD_SCHEMA,
        triggerable: true,
    };
}

const channelsDataSource: DataSourceAdapter = {
    id: "channels",
    label: "Discord channels",
    fetch: async (clanId: string): Promise<readonly DataSourceItem[]> => listChannelsForClan(clanId),
};

function listChannelsForClan(clanId: string): readonly DataSourceItem[] {
    const items: DataSourceItem[] = [];
    const guildIds = listGuildsForClan(clanId);
    for (const guildId of guildIds) {
        for (const row of readChannelsForGuild(clanId, guildId)) {
            items.push({ id: row.id, name: row.name, kind: String(row.type) });
        }
    }
    return items;
}

function listGuildsForClan(_clanId: string): readonly string[] {
    return [];
}

interface ChannelRow {
    id: string;
    name: string;
    type: number;
}

function readChannelsForGuild(clanId: string, guildId: string): readonly ChannelRow[] {
    const db = discordGuildDb(clanId, guildId);
    const rows = db.prepare("SELECT id, name, type FROM discord_channels").all() as ChannelRow[];
    return rows;
}

export const manifest: CapabilityManifest = {
    name: CAPABILITY_NAME,
    version: "0.2.0",
    capability_color: CAPABILITY_COLOR,
    operations: {
        "discord:channels.create": channelCreateOp,
    },
    triggers: {
        "discord:channels.created": channelTrigger("discord.gateway.channelCreate"),
        "discord:channels.updated": channelTrigger("discord.gateway.channelUpdate"),
        "discord:channels.deleted": channelTrigger("discord.gateway.channelDelete"),
    },
    data_sources: {
        channels: channelsDataSource,
    },
};
