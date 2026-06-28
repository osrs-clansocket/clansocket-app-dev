import { registerOperation } from "../../flows/registries/operation-registry.js";
import type { OperationContext, OperationResult } from "../../flows/registries/registry-types.js";
import type { FlowFieldList } from "../../flows/registries/payload-field-types.js";
import {
    TARGET_KIND_CHANNEL_MESSAGE,
    TARGET_KIND_DM,
    TARGET_KIND_WEBHOOK_POST,
    enqueue,
    readString,
} from "./manifest-shared.js";
import {
    FIELD_AVATAR_URL,
    FIELD_CHANNEL,
    FIELD_CONTENT,
    FIELD_USER,
    FIELD_WEBHOOK,
} from "./manifest-field-primitives.js";
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

import { SEND_RESULT_CLASSES } from "./result-classes.js";
const QUEUE_OUTPUT: FlowFieldList = [{ name: "queueId", type: "string" }];

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

function sendOp(opId: string, inputFields: FlowFieldList, handler: (i: Readonly<Record<string, unknown>>, c: OperationContext) => Promise<OperationResult>): void {
    registerOperation({
        capability: "discord",
        opId,
        safety_tier: "live",
        inputFields,
        outputFields: QUEUE_OUTPUT,
        result_classes: SEND_RESULT_CLASSES,
        side_effects: { writes_outbound: true, writes_audit: true, rate_limit_route: "/channels/:id/messages" },
        validation: { bot_permission: "SendMessages" },
        handler,
    });
}

sendOp("discord:send-message", [FIELD_CHANNEL, FIELD_CONTENT], sendMessage);

sendOp("discord:send-embed", [
    FIELD_CHANNEL,
    { name: "title", type: "string", required: true, minLength: 1, maxLength: 256 },
    { name: "description", type: "string", maxLength: 4096 },
    { name: "color", type: "integer" },
    { name: "url", type: "string", maxLength: 2048 },
], sendEmbed);

sendOp("discord:send-dm", [FIELD_USER, FIELD_CONTENT], sendDm);

sendOp("discord:send-webhook", [
    FIELD_WEBHOOK,
    FIELD_CONTENT,
    { name: "username", type: "string", maxLength: 80 },
    FIELD_AVATAR_URL,
], sendWebhook);
