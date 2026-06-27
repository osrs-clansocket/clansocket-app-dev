import type {
    JSONSchema,
    OperationContext,
    OperationResult,
    OperationSpec,
} from "../../flows/registries/registry-types.js";
import {
    ENQUEUE_RESULT_SCHEMA,
    STRUCTURAL_RESULT_CLASSES,
    structuralEnqueueHandler,
} from "./manifest-shared.js";

const CHANNEL_UPDATE_INPUT: JSONSchema = {
    type: "object",
    required: ["guildId", "channelId"],
    additionalProperties: false,
    properties: {
        guildId: { type: "string", format: "discord-guild-id" },
        channelId: { type: "string", format: "discord-channel-id" },
        name: { type: "string", minLength: 1, maxLength: 100 },
        topic: { type: "string", maxLength: 1024 },
        parentId: { type: "string", format: "discord-channel-id" },
        position: { type: "integer" },
        reason: { type: "string", maxLength: 512 },
    },
};

const CHANNEL_DELETE_INPUT: JSONSchema = {
    type: "object",
    required: ["guildId", "channelId"],
    additionalProperties: false,
    properties: {
        guildId: { type: "string", format: "discord-guild-id" },
        channelId: { type: "string", format: "discord-channel-id" },
        reason: { type: "string", maxLength: 512 },
    },
};

const CHANNEL_MOVE_INPUT: JSONSchema = {
    type: "object",
    required: ["guildId", "channelId", "position"],
    additionalProperties: false,
    properties: {
        guildId: { type: "string", format: "discord-guild-id" },
        channelId: { type: "string", format: "discord-channel-id" },
        position: { type: "integer", minimum: 0 },
        reason: { type: "string", maxLength: 512 },
    },
};

async function channelUpdate(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    const extra: Record<string, unknown> = {};
    if (typeof input.name === "string") extra.name = input.name;
    if (typeof input.topic === "string") extra.topic = input.topic;
    if (typeof input.parentId === "string") extra.parent_id = input.parentId;
    if (typeof input.position === "number") extra.position = input.position;
    return structuralEnqueueHandler("channel.update", "channelId", input, ctx, extra);
}

async function channelDelete(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    return structuralEnqueueHandler("channel.delete", "channelId", input, ctx, {});
}

async function channelMove(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    return structuralEnqueueHandler("channel.move", "channelId", input, ctx, {
        position: typeof input.position === "number" ? input.position : 0,
    });
}

function channelStructuralOp(input_schema: JSONSchema, handler: OperationSpec["handler"]): OperationSpec {
    return {
        safety_tier: "manual",
        input_schema,
        output_schema: ENQUEUE_RESULT_SCHEMA,
        side_effects: { writes_outbound: true, writes_audit: true },
        validation: { bot_permission: "ManageChannels" },
        result_classes: STRUCTURAL_RESULT_CLASSES,
        handler,
    };
}

export const CHANNEL_STRUCTURAL_OPS: Readonly<Record<string, OperationSpec>> = {
    "discord:channels.update": channelStructuralOp(CHANNEL_UPDATE_INPUT, channelUpdate),
    "discord:channels.delete": channelStructuralOp(CHANNEL_DELETE_INPUT, channelDelete),
    "discord:channels.move": channelStructuralOp(CHANNEL_MOVE_INPUT, channelMove),
};
