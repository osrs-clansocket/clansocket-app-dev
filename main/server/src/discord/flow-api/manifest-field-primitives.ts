import type { FlowField } from "../../flows/registries/payload-field-types.js";

export const FIELD_GUILD: FlowField = {
    name: "guildId",
    type: "discord-guild-id",
    valueSourceRef: "discord-guild-id",
    required: true,
};

export const FIELD_CHANNEL: FlowField = {
    name: "channelId",
    type: "discord-channel-id",
    valueSourceRef: "discord-channel-id",
    required: true,
};

export const FIELD_CHANNEL_OPTIONAL: FlowField = {
    name: "channelId",
    type: "discord-channel-id",
    valueSourceRef: "discord-channel-id",
};

export const FIELD_PARENT_CHANNEL: FlowField = {
    name: "parentId",
    type: "discord-channel-id",
    valueSourceRef: "discord-channel-id",
};

export const FIELD_ROLE: FlowField = {
    name: "roleId",
    type: "discord-role-id",
    valueSourceRef: "discord-role-id",
    required: true,
};

export const FIELD_USER: FlowField = {
    name: "userId",
    type: "discord-member-id",
    valueSourceRef: "discord-member-id",
    required: true,
};

export const FIELD_WEBHOOK: FlowField = {
    name: "webhookId",
    type: "discord-webhook-id",
    valueSourceRef: "discord-webhook-id",
    required: true,
};

export const FIELD_REASON: FlowField = {
    name: "reason",
    type: "string",
    maxLength: 512,
};

export const FIELD_CONTENT: FlowField = {
    name: "content",
    type: "string",
    required: true,
    minLength: 1,
    maxLength: 2000,
};

export const FIELD_COLOR: FlowField = {
    name: "color",
    type: "integer",
    minimum: 0,
    maximum: 16_777_215,
};

export const FIELD_HOIST: FlowField = { name: "hoist", type: "boolean" };
export const FIELD_MENTIONABLE: FlowField = { name: "mentionable", type: "boolean" };
export const FIELD_NAME_100: FlowField = { name: "name", type: "string", required: true, minLength: 1, maxLength: 100 };
export const FIELD_NAME_80: FlowField = { name: "name", type: "string", required: true, minLength: 1, maxLength: 80 };
export const FIELD_POSITION: FlowField = { name: "position", type: "integer", required: true, minimum: 0 };
export const FIELD_POSITION_OPTIONAL: FlowField = { name: "position", type: "integer" };
export const FIELD_AVATAR_URL: FlowField = { name: "avatarUrl", type: "string", maxLength: 2048 };
export const FIELD_IMAGE_URL: FlowField = { name: "imageUrl", type: "string", required: true, maxLength: 2048 };
export const FIELD_TOPIC: FlowField = { name: "topic", type: "string", maxLength: 1024 };
