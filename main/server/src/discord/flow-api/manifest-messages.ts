import { registerOperation } from "../../flows/registries/operation-registry.js";
import type { OperationContext, OperationResult } from "../../flows/registries/registry-types.js";
import { TARGET_KIND_STRUCTURAL_MUTATION, enqueue, readString } from "./manifest-shared.js";
import {
    FIELD_GUILD,
    FIELD_NAME_100,
    FIELD_PARENT_CHANNEL,
    FIELD_POSITION_OPTIONAL,
    FIELD_TOPIC,
} from "./manifest-field-primitives.js";

import { MESSAGE_OP_RESULT_CLASSES as CHANNEL_OP_RESULT_CLASSES } from "./result-classes.js";

async function channelCreate(
    input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
): Promise<OperationResult> {
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

registerOperation({
    capability: "discord",
    opId: "discord:channels.create",
    safety_tier: "live",
    inputFields: [
        FIELD_GUILD,
        FIELD_NAME_100,
        { name: "type", type: "channel-type", valueSourceRef: "discord-channel-type", required: true },
        FIELD_TOPIC,
        { name: "bitrate", type: "integer" },
        { name: "user_limit", type: "integer" },
        FIELD_POSITION_OPTIONAL,
        FIELD_PARENT_CHANNEL,
        { name: "nsfw", type: "boolean" },
        { name: "rate_limit_per_user", type: "integer" },
    ],
    outputFields: [{ name: "queueId", type: "string" }],
    result_classes: CHANNEL_OP_RESULT_CLASSES,
    side_effects: {
        writes_outbound: true,
        writes_audit: true,
        rate_limit_route: "/guilds/:id/channels",
        emits: ["discord:channels.created"],
    },
    validation: { bot_permission: "ManageChannels", clansocket_permission: "discord:channels.create" },
    handler: channelCreate,
});
