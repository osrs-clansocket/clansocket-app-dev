import type {
    JSONSchema,
    OperationContext,
    OperationResult,
    OperationSpec,
} from "../../flows/registries/registry-types.js";
import {
    ENQUEUE_RESULT_SCHEMA,
    TARGET_KIND_STRUCTURAL_MUTATION,
    enqueue,
    readString,
} from "./manifest-shared.js";
import { DISCORD_CHANNEL_TYPE_LABELS, DISCORD_CHANNEL_TYPE_VALUES } from "./schema-enums.js";

const CHANNEL_CREATE_INPUT_SCHEMA: JSONSchema = {
    type: "object",
    required: ["guildId", "name", "type"],
    additionalProperties: false,
    properties: {
        guildId: { type: "string", format: "discord-guild-id" },
        name: { type: "string", minLength: 1, maxLength: 100 },
        type: {
            type: "integer",
            enum: DISCORD_CHANNEL_TYPE_VALUES as number[],
            enumLabels: DISCORD_CHANNEL_TYPE_LABELS as string[],
        },
        topic: { type: "string", maxLength: 1024 },
        bitrate: { type: "integer" },
        user_limit: { type: "integer" },
        position: { type: "integer" },
        parent_id: { type: "string", format: "discord-channel-id" },
        nsfw: { type: "boolean" },
        rate_limit_per_user: { type: "integer" },
    },
};

const CHANNEL_OP_RESULT_CLASSES: readonly string[] = [
    "sent",
    "rate_limit",
    "permission_denied",
    "channel_not_found",
    "bot_missing_in_guild",
];

async function channelCreate(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    const guildId = readString(input, "guildId");
    const name = readString(input, "name");
    const payload: Record<string, unknown> = {
        structural_action: "channel.create",
        guild_id: guildId,
        name,
        channel_type: input.type,
    };
    if (typeof input.topic === "string") payload.topic = input.topic;
    if (typeof input.parent_id === "string") payload.parent_id = input.parent_id;
    if (typeof input.position === "number") payload.position = input.position;
    if (typeof input.nsfw === "boolean") payload.nsfw = input.nsfw;
    if (typeof input.bitrate === "number") payload.bitrate = input.bitrate;
    if (typeof input.user_limit === "number") payload.user_limit = input.user_limit;
    if (typeof input.rate_limit_per_user === "number") payload.rate_limit_per_user = input.rate_limit_per_user;
    const queueId = enqueue(ctx, guildId, {
        targetKind: TARGET_KIND_STRUCTURAL_MUTATION,
        targetId: guildId,
        targetName: name,
        payload,
    });
    return { result_class: "sent", outputs: { queueId } };
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
    validation: { bot_permission: "ManageChannels", clansocket_permission: "discord:channels.create" },
    result_classes: CHANNEL_OP_RESULT_CLASSES,
    handler: channelCreate,
};

export const MESSAGE_OPS: Readonly<Record<string, OperationSpec>> = {
    "discord:channels.create": channelCreateOp,
};
