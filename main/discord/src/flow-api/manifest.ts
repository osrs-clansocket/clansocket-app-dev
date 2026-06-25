import {
    CREATE_INPUT,
    DELETE_INPUT,
    MOVE_INPUT,
    SET_PERMISSIONS_INPUT,
    UPDATE_INPUT,
} from "./manifest-channel-inputs.js";
import type { CapabilityManifest, JSONSchema } from "./manifest-types.js";
import { objectSchema } from "./schema-builders.js";
import { addSubscriber } from "./trigger-bus.js";
import { makeChannelOp } from "./manifest-channel-ops.js";

const CHANNEL_TRIGGER_PAYLOAD_SCHEMA: JSONSchema = objectSchema(
    {
        id: { type: "string" },
        name: { type: "string" },
        guildId: { type: "string" },
        type: { type: "number" },
    },
    ["id", "name", "guildId", "type"],
);

const TRIGGER_CHANNEL_CREATED = "discord:channels.created";
const TRIGGER_CHANNEL_UPDATED = "discord:channels.updated";
const TRIGGER_CHANNEL_DELETED = "discord:channels.deleted";

function channelTriggerEntry(triggerId: string, eventSource: string) {
    return {
        event_source: eventSource,
        payload_schema: CHANNEL_TRIGGER_PAYLOAD_SCHEMA,
        subscriber: (emit: (event: unknown) => void) => addSubscriber(triggerId, emit),
    };
}

export const manifest: CapabilityManifest = {
    name: "discord",
    version: "0.1.0",
    operations: {
        "discord:channels.create": makeChannelOp(
            "discord:channels.create",
            "/guilds/:id/channels",
            [TRIGGER_CHANNEL_CREATED],
            CREATE_INPUT,
        ),
        "discord:channels.update": makeChannelOp(
            "discord:channels.update",
            "/channels/:id",
            [TRIGGER_CHANNEL_UPDATED],
            UPDATE_INPUT,
        ),
        "discord:channels.delete": makeChannelOp(
            "discord:channels.delete",
            "/channels/:id",
            [TRIGGER_CHANNEL_DELETED],
            DELETE_INPUT,
        ),
        "discord:channels.move": makeChannelOp(
            "discord:channels.move",
            "/channels/:id",
            [TRIGGER_CHANNEL_UPDATED],
            MOVE_INPUT,
        ),
        "discord:channels.set-permissions": makeChannelOp(
            "discord:channels.set-permissions",
            "/channels/:id/permissions/:overwriteId",
            [TRIGGER_CHANNEL_UPDATED],
            SET_PERMISSIONS_INPUT,
        ),
    },
    triggers: {
        [TRIGGER_CHANNEL_CREATED]: channelTriggerEntry(TRIGGER_CHANNEL_CREATED, "discord.gateway.channelCreate"),
        [TRIGGER_CHANNEL_UPDATED]: channelTriggerEntry(TRIGGER_CHANNEL_UPDATED, "discord.gateway.channelUpdate"),
        [TRIGGER_CHANNEL_DELETED]: channelTriggerEntry(TRIGGER_CHANNEL_DELETED, "discord.gateway.channelDelete"),
    },
};
