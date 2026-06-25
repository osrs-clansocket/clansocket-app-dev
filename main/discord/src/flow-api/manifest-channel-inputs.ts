import type { JSONSchema } from "./manifest-types.js";
import { objectSchema } from "./schema-builders.js";

const CHANNEL_STATE_SCHEMA: JSONSchema = objectSchema(
    {
        name: { type: "string" },
        topic: { type: ["string", "null"] },
        nsfw: { type: "boolean" },
        rateLimitPerUser: { type: "number" },
        parentId: { type: ["string", "null"] },
    },
    ["name"],
);

export const CREATE_INPUT: JSONSchema = objectSchema(
    {
        userId: { type: "string" },
        name: { type: "string" },
        channelType: { type: "number" },
        parentId: { type: ["string", "null"] },
        topic: { type: ["string", "null"] },
        nsfw: { type: "boolean" },
        rateLimitPerUser: { type: "number" },
    },
    ["userId", "name", "channelType"],
);

export const UPDATE_INPUT: JSONSchema = objectSchema(
    {
        userId: { type: "string" },
        channelId: { type: "string" },
        before: CHANNEL_STATE_SCHEMA,
        after: CHANNEL_STATE_SCHEMA,
    },
    ["userId", "channelId", "before", "after"],
);

export const DELETE_INPUT: JSONSchema = objectSchema(
    {
        userId: { type: "string" },
        channelId: { type: "string" },
        channelName: { type: "string" },
        channelType: { type: "number" },
    },
    ["userId", "channelId", "channelName", "channelType"],
);

export const MOVE_INPUT: JSONSchema = objectSchema(
    {
        userId: { type: "string" },
        channelId: { type: "string" },
        beforePosition: { type: "number" },
        afterPosition: { type: "number" },
        beforeParentId: { type: ["string", "null"] },
        afterParentId: { type: ["string", "null"] },
    },
    ["userId", "channelId", "beforePosition", "afterPosition"],
);

export const SET_PERMISSIONS_INPUT: JSONSchema = objectSchema(
    {
        userId: { type: "string" },
        channelId: { type: "string" },
        channelName: { type: "string" },
        overwriteKind: { enum: ["role", "member"] },
        overwriteTargetId: { type: "string" },
        overwriteTargetName: { type: "string" },
        allow: { type: "string" },
        deny: { type: "string" },
    },
    ["userId", "channelId", "overwriteKind", "overwriteTargetId", "allow", "deny"],
);
