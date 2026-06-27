import type {
    JSONSchema,
    OperationContext,
    OperationResult,
    OperationSpec,
} from "../../flows/registries/registry-types.js";
import {
    ENQUEUE_RESULT_SCHEMA,
    STRUCTURAL_RESULT_CLASSES,
    readString,
    structuralEnqueueHandler,
} from "./manifest-shared.js";

const WEBHOOK_CREATE_INPUT: JSONSchema = {
    type: "object",
    required: ["guildId", "channelId", "name"],
    additionalProperties: false,
    properties: {
        guildId: { type: "string", format: "discord-guild-id" },
        channelId: { type: "string", format: "discord-channel-id" },
        name: { type: "string", minLength: 1, maxLength: 80 },
        avatarUrl: { type: "string", maxLength: 2048 },
        reason: { type: "string", maxLength: 512 },
    },
};

const WEBHOOK_DELETE_INPUT: JSONSchema = {
    type: "object",
    required: ["guildId", "webhookId"],
    additionalProperties: false,
    properties: {
        guildId: { type: "string", format: "discord-guild-id" },
        webhookId: { type: "string", format: "discord-webhook-id" },
        reason: { type: "string", maxLength: 512 },
    },
};

async function webhookCreate(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    const extra: Record<string, unknown> = {
        name: readString(input, "name"),
        channel_id: readString(input, "channelId"),
    };
    if (typeof input.avatarUrl === "string") extra.avatar_url = input.avatarUrl;
    return structuralEnqueueHandler("webhook.create", "channelId", input, ctx, extra);
}

async function webhookDelete(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    return structuralEnqueueHandler("webhook.delete", "webhookId", input, ctx, {});
}

function webhookOp(safety_tier: "live" | "manual", input_schema: JSONSchema, handler: OperationSpec["handler"]): OperationSpec {
    return {
        safety_tier,
        input_schema,
        output_schema: ENQUEUE_RESULT_SCHEMA,
        side_effects: { writes_outbound: true, writes_audit: true },
        validation: { bot_permission: "ManageWebhooks" },
        result_classes: STRUCTURAL_RESULT_CLASSES,
        handler,
    };
}

export const WEBHOOK_OPS: Readonly<Record<string, OperationSpec>> = {
    "discord:webhooks.create": webhookOp("live", WEBHOOK_CREATE_INPUT, webhookCreate),
    "discord:webhooks.delete": webhookOp("manual", WEBHOOK_DELETE_INPUT, webhookDelete),
};
