import { enqueueOutboundEvent } from "../../database/discord/outbound/enqueue.js";
import { discordGuildDb } from "../../database/discord/discord.js";
import { listByClan } from "../../database/discord/servers/list-by-clan.js";
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
const TARGET_KIND_CHANNEL_MESSAGE = "channel_message";
const TARGET_KIND_DM = "dm";
const TARGET_KIND_WEBHOOK_POST = "webhook_post";
const TARGET_KIND_MEMBER_MUTATION = "member_mutation";

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

const SEND_MESSAGE_INPUT: JSONSchema = {
    type: "object",
    required: ["channelId", "content"],
    additionalProperties: false,
    properties: {
        channelId: { type: "string", format: "discord-channel-id" },
        content: { type: "string", minLength: 1, maxLength: 2000 },
    },
};

const SEND_EMBED_INPUT: JSONSchema = {
    type: "object",
    required: ["channelId", "title"],
    additionalProperties: false,
    properties: {
        channelId: { type: "string", format: "discord-channel-id" },
        title: { type: "string", minLength: 1, maxLength: 256 },
        description: { type: "string", maxLength: 4096 },
        color: { type: "integer" },
        url: { type: "string", maxLength: 2048 },
    },
};

const SEND_DM_INPUT: JSONSchema = {
    type: "object",
    required: ["userId", "content"],
    additionalProperties: false,
    properties: {
        userId: { type: "string", format: "discord-member-id" },
        content: { type: "string", minLength: 1, maxLength: 2000 },
    },
};

const SEND_WEBHOOK_INPUT: JSONSchema = {
    type: "object",
    required: ["webhookId", "content"],
    additionalProperties: false,
    properties: {
        webhookId: { type: "string" },
        content: { type: "string", minLength: 1, maxLength: 2000 },
        username: { type: "string", maxLength: 80 },
        avatarUrl: { type: "string", maxLength: 2048 },
    },
};

async function genericMessageEnqueueHandler(
    targetKind: string,
    targetKey: string,
    input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
    payload: Readonly<Record<string, unknown>>,
): Promise<OperationResult> {
    const guildId = ctx.guildId ?? "";
    const botId = requireBotId(ctx);
    const targetId = readString(input, targetKey);
    const queueId = enqueueOutboundEvent({
        botId,
        guildId,
        clanId: ctx.clanId,
        targetKind,
        targetId,
        targetName: null,
        payload,
        flowIdOrigin: ctx.flowId,
        flowName: ctx.flowName,
        flowVersion: String(ctx.flowVersion),
    });
    return { result_class: "sent", outputs: { queueId } };
}

async function sendMessageHandler(
    input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
): Promise<OperationResult> {
    return genericMessageEnqueueHandler(TARGET_KIND_CHANNEL_MESSAGE, "channelId", input, ctx, {
        content: readString(input, "content"),
    });
}

async function sendEmbedHandler(
    input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
): Promise<OperationResult> {
    const embed: Record<string, unknown> = { title: readString(input, "title") };
    if (typeof input.description === "string") embed.description = input.description;
    if (typeof input.color === "number") embed.color = input.color;
    if (typeof input.url === "string") embed.url = input.url;
    return genericMessageEnqueueHandler(TARGET_KIND_CHANNEL_MESSAGE, "channelId", input, ctx, {
        embeds: [embed],
    });
}

async function sendDmHandler(
    input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
): Promise<OperationResult> {
    return genericMessageEnqueueHandler(TARGET_KIND_DM, "userId", input, ctx, {
        content: readString(input, "content"),
    });
}

async function sendWebhookHandler(
    input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
): Promise<OperationResult> {
    return genericMessageEnqueueHandler(TARGET_KIND_WEBHOOK_POST, "webhookId", input, ctx, {
        content: readString(input, "content"),
        username: typeof input.username === "string" ? input.username : undefined,
        avatar_url: typeof input.avatarUrl === "string" ? input.avatarUrl : undefined,
    });
}

const SEND_RESULT_CLASSES: readonly string[] = ["sent", "rate_limit", "permission_denied", "channel_not_found"];

function sendOp(input_schema: JSONSchema, handler: OperationSpec["handler"]): OperationSpec {
    return {
        safety_tier: "live",
        input_schema,
        output_schema: ENQUEUE_RESULT_SCHEMA,
        side_effects: { writes_outbound: true, writes_audit: true, rate_limit_route: "/channels/:id/messages" },
        validation: { bot_permission: "SendMessages" },
        result_classes: SEND_RESULT_CLASSES,
        handler,
    };
}

const MEMBER_ADD_ROLE_INPUT: JSONSchema = {
    type: "object",
    required: ["guildId", "userId", "roleId"],
    additionalProperties: false,
    properties: {
        guildId: { type: "string" },
        userId: { type: "string", format: "discord-member-id" },
        roleId: { type: "string", format: "discord-role-id" },
        reason: { type: "string", maxLength: 512 },
    },
};

const MEMBER_REMOVE_ROLE_INPUT: JSONSchema = MEMBER_ADD_ROLE_INPUT;

const MEMBER_NICKNAME_INPUT: JSONSchema = {
    type: "object",
    required: ["guildId", "userId"],
    additionalProperties: false,
    properties: {
        guildId: { type: "string" },
        userId: { type: "string", format: "discord-member-id" },
        nickname: { type: "string", maxLength: 32 },
        reason: { type: "string", maxLength: 512 },
    },
};

const MEMBER_TIMEOUT_INPUT: JSONSchema = {
    type: "object",
    required: ["guildId", "userId", "durationMs"],
    additionalProperties: false,
    properties: {
        guildId: { type: "string" },
        userId: { type: "string", format: "discord-member-id" },
        durationMs: { type: "integer", minimum: 0, maximum: 2_419_200_000 },
        reason: { type: "string", maxLength: 512 },
    },
};

const MEMBER_KICK_INPUT: JSONSchema = {
    type: "object",
    required: ["guildId", "userId"],
    additionalProperties: false,
    properties: {
        guildId: { type: "string" },
        userId: { type: "string", format: "discord-member-id" },
        reason: { type: "string", maxLength: 512 },
    },
};

const MEMBER_BAN_INPUT: JSONSchema = {
    type: "object",
    required: ["guildId", "userId"],
    additionalProperties: false,
    properties: {
        guildId: { type: "string" },
        userId: { type: "string", format: "discord-member-id" },
        reason: { type: "string", maxLength: 512 },
        deleteMessageDays: { type: "integer", minimum: 0, maximum: 7 },
    },
};

async function memberMutationEnqueueHandler(
    action: string,
    input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
    extra: Readonly<Record<string, unknown>>,
): Promise<OperationResult> {
    const guildId = readString(input, "guildId");
    const userId = readString(input, "userId");
    const botId = requireBotId(ctx);
    const payload: Record<string, unknown> = {
        member_action: action,
        guild_id: guildId,
        ...extra,
    };
    if (typeof input.reason === "string") payload.reason = input.reason;
    const queueId = enqueueOutboundEvent({
        botId,
        guildId,
        clanId: ctx.clanId,
        targetKind: TARGET_KIND_MEMBER_MUTATION,
        targetId: userId,
        targetName: null,
        payload,
        flowIdOrigin: ctx.flowId,
        flowName: ctx.flowName,
        flowVersion: String(ctx.flowVersion),
    });
    return { result_class: "queued", outputs: { queueId } };
}

async function memberAddRoleHandler(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    return memberMutationEnqueueHandler("add-role", input, ctx, { role_id: readString(input, "roleId") });
}

async function memberRemoveRoleHandler(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    return memberMutationEnqueueHandler("remove-role", input, ctx, { role_id: readString(input, "roleId") });
}

async function memberSetNicknameHandler(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    const extra: Record<string, unknown> = {};
    if (typeof input.nickname === "string") extra.nickname = input.nickname;
    return memberMutationEnqueueHandler("set-nickname", input, ctx, extra);
}

async function memberTimeoutHandler(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    return memberMutationEnqueueHandler("timeout", input, ctx, { duration_ms: input.durationMs ?? 0 });
}

async function memberKickHandler(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    return memberMutationEnqueueHandler("kick", input, ctx, {});
}

async function memberBanHandler(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    const extra: Record<string, unknown> = {};
    if (typeof input.deleteMessageDays === "number") extra.delete_message_days = input.deleteMessageDays;
    return memberMutationEnqueueHandler("ban", input, ctx, extra);
}

async function memberUnbanHandler(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    return memberMutationEnqueueHandler("unban", input, ctx, {});
}

const MEMBER_RESULT_CLASSES: readonly string[] = ["queued", "permission_denied", "member_not_found", "guild_not_found"];

function memberOp(
    safety_tier: "live" | "manual",
    input_schema: JSONSchema,
    handler: OperationSpec["handler"],
    botPermission: string,
): OperationSpec {
    return {
        safety_tier,
        input_schema,
        output_schema: ENQUEUE_RESULT_SCHEMA,
        side_effects: { writes_outbound: true, writes_audit: true },
        validation: { bot_permission: botPermission },
        result_classes: MEMBER_RESULT_CLASSES,
        handler,
    };
}

const channelCreateOp: OperationSpec = {
    safety_tier: "live",
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

function listGuildsForClan(clanId: string): readonly string[] {
    return listByClan(clanId).map((row) => row.guild_id);
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
        "discord:send-message": sendOp(SEND_MESSAGE_INPUT, sendMessageHandler),
        "discord:send-embed": sendOp(SEND_EMBED_INPUT, sendEmbedHandler),
        "discord:send-dm": sendOp(SEND_DM_INPUT, sendDmHandler),
        "discord:send-webhook": sendOp(SEND_WEBHOOK_INPUT, sendWebhookHandler),
        "discord:members.add-role": memberOp("live", MEMBER_ADD_ROLE_INPUT, memberAddRoleHandler, "ManageRoles"),
        "discord:members.set-nickname": memberOp("live", MEMBER_NICKNAME_INPUT, memberSetNicknameHandler, "ManageNicknames"),
        "discord:members.remove-role": memberOp("manual", MEMBER_REMOVE_ROLE_INPUT, memberRemoveRoleHandler, "ManageRoles"),
        "discord:members.timeout": memberOp("manual", MEMBER_TIMEOUT_INPUT, memberTimeoutHandler, "ModerateMembers"),
        "discord:members.kick": memberOp("manual", MEMBER_KICK_INPUT, memberKickHandler, "KickMembers"),
        "discord:members.ban": memberOp("manual", MEMBER_BAN_INPUT, memberBanHandler, "BanMembers"),
        "discord:members.unban": memberOp("manual", MEMBER_KICK_INPUT, memberUnbanHandler, "BanMembers"),
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
