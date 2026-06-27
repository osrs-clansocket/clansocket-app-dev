import type {
    JSONSchema,
    OperationContext,
    OperationResult,
    OperationSpec,
} from "../../flows/registries/registry-types.js";
import {
    ENQUEUE_RESULT_SCHEMA,
    TARGET_KIND_CHANNEL_MESSAGE,
    TARGET_KIND_DM,
    TARGET_KIND_WEBHOOK_POST,
    enqueue,
    readString,
} from "./manifest-shared.js";
import { discordGuildDb } from "../../database/discord/discord.js";
import { listByClan } from "../../database/discord/servers/list-by-clan.js";
import { decryptedWebhookToken } from "../../database/discord/webhook-tokens/get-decrypted.js";

function resolveWebhookGuild(clanId: string, webhookId: string): string | null {
    for (const row of listByClan(clanId)) {
        const db = discordGuildDb(clanId, row.guild_id);
        const exists = db.prepare("SELECT 1 FROM discord_webhooks WHERE webhook_id = ?").get(webhookId);
        if (exists) return row.guild_id;
    }
    return null;
}

const SEND_RESULT_CLASSES: readonly string[] = ["sent", "rate_limit", "permission_denied", "channel_not_found"];

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
        webhookId: { type: "string", format: "discord-webhook-id" },
        content: { type: "string", minLength: 1, maxLength: 2000 },
        username: { type: "string", maxLength: 80 },
        avatarUrl: { type: "string", maxLength: 2048 },
    },
};

async function enqueueMessage(
    targetKind: string,
    targetKey: string,
    input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
    payload: Readonly<Record<string, unknown>>,
): Promise<OperationResult> {
    const targetId = readString(input, targetKey);
    const queueId = enqueue(ctx, ctx.guildId ?? "", {
        targetKind,
        targetId,
        targetName: null,
        payload,
    });
    return { result_class: "sent", outputs: { queueId } };
}

async function sendMessage(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    return enqueueMessage(TARGET_KIND_CHANNEL_MESSAGE, "channelId", input, ctx, { content: readString(input, "content") });
}

async function sendEmbed(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    const embed: Record<string, unknown> = { title: readString(input, "title") };
    if (typeof input.description === "string") embed.description = input.description;
    if (typeof input.color === "number") embed.color = input.color;
    if (typeof input.url === "string") embed.url = input.url;
    return enqueueMessage(TARGET_KIND_CHANNEL_MESSAGE, "channelId", input, ctx, { embeds: [embed] });
}

async function sendDm(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    return enqueueMessage(TARGET_KIND_DM, "userId", input, ctx, { content: readString(input, "content") });
}

async function sendWebhook(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    const webhookId = readString(input, "webhookId");
    const guildId = resolveWebhookGuild(ctx.clanId, webhookId);
    if (!guildId) return { result_class: "channel_not_found", outputs: {} };
    const token = decryptedWebhookToken(ctx.clanId, guildId, webhookId);
    if (!token) return { result_class: "permission_denied", outputs: {} };
    const envelope: Record<string, unknown> = { content: readString(input, "content") };
    if (typeof input.username === "string") envelope.username = input.username;
    if (typeof input.avatarUrl === "string") envelope.avatar_url = input.avatarUrl;
    const queueId = enqueue(ctx, guildId, {
        targetKind: TARGET_KIND_WEBHOOK_POST,
        targetId: webhookId,
        targetName: null,
        payload: { envelope, webhookId, token },
    });
    return { result_class: "sent", outputs: { queueId } };
}

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

export const SEND_OPS: Readonly<Record<string, OperationSpec>> = {
    "discord:send-message": sendOp(SEND_MESSAGE_INPUT, sendMessage),
    "discord:send-embed": sendOp(SEND_EMBED_INPUT, sendEmbed),
    "discord:send-dm": sendOp(SEND_DM_INPUT, sendDm),
    "discord:send-webhook": sendOp(SEND_WEBHOOK_INPUT, sendWebhook),
};
