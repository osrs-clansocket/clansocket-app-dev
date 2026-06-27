import type {
    JSONSchema,
    OperationContext,
    OperationResult,
    OperationSpec,
} from "../../flows/registries/registry-types.js";
import {
    ENQUEUE_RESULT_SCHEMA,
    STRUCTURAL_RESULT_CLASSES,
    TARGET_KIND_GUILD_SETTINGS,
    enqueue,
    readString,
} from "./manifest-shared.js";
import { DISCORD_VERIFICATION_LEVEL_LABELS, DISCORD_VERIFICATION_LEVEL_VALUES } from "./schema-enums.js";

const GUILD_NAME_INPUT: JSONSchema = {
    type: "object",
    required: ["guildId", "name"],
    additionalProperties: false,
    properties: {
        guildId: { type: "string", format: "discord-guild-id" },
        name: { type: "string", minLength: 2, maxLength: 100 },
        reason: { type: "string", maxLength: 512 },
    },
};

const GUILD_IMAGE_INPUT: JSONSchema = {
    type: "object",
    required: ["guildId", "imageUrl"],
    additionalProperties: false,
    properties: {
        guildId: { type: "string", format: "discord-guild-id" },
        imageUrl: { type: "string", maxLength: 2048 },
        reason: { type: "string", maxLength: 512 },
    },
};

const GUILD_DESCRIPTION_INPUT: JSONSchema = {
    type: "object",
    required: ["guildId"],
    additionalProperties: false,
    properties: {
        guildId: { type: "string", format: "discord-guild-id" },
        description: { type: "string", maxLength: 300 },
        reason: { type: "string", maxLength: 512 },
    },
};

const GUILD_CHANNEL_REF_INPUT: JSONSchema = {
    type: "object",
    required: ["guildId"],
    additionalProperties: false,
    properties: {
        guildId: { type: "string", format: "discord-guild-id" },
        channelId: { type: "string", format: "discord-channel-id" },
        afkTimeout: { type: "integer", minimum: 60, maximum: 3600 },
        reason: { type: "string", maxLength: 512 },
    },
};

const GUILD_VERIFICATION_INPUT: JSONSchema = {
    type: "object",
    required: ["guildId", "verificationLevel"],
    additionalProperties: false,
    properties: {
        guildId: { type: "string", format: "discord-guild-id" },
        verificationLevel: {
            type: "integer",
            enum: DISCORD_VERIFICATION_LEVEL_VALUES as number[],
            enumLabels: DISCORD_VERIFICATION_LEVEL_LABELS as string[],
        },
        reason: { type: "string", maxLength: 512 },
    },
};

async function guildSettingsEnqueueHandler(
    settingKey: string,
    input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
    extra: Readonly<Record<string, unknown>>,
): Promise<OperationResult> {
    const guildId = readString(input, "guildId");
    const payload: Record<string, unknown> = { setting_key: settingKey, ...extra };
    if (typeof input.reason === "string") payload.reason = input.reason;
    const queueId = enqueue(ctx, guildId, {
        targetKind: TARGET_KIND_GUILD_SETTINGS,
        targetId: guildId,
        targetName: null,
        payload,
    });
    return { result_class: "queued", outputs: { queueId } };
}

const setName = (input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> =>
    guildSettingsEnqueueHandler("set-name", input, ctx, { name: readString(input, "name") });

const setIcon = (input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> =>
    guildSettingsEnqueueHandler("set-icon", input, ctx, { icon_url: readString(input, "imageUrl") });

const setBanner = (input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> =>
    guildSettingsEnqueueHandler("set-banner", input, ctx, { banner_url: readString(input, "imageUrl") });

function setDescription(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    const extra: Record<string, unknown> = {};
    if (typeof input.description === "string") extra.description = input.description;
    return guildSettingsEnqueueHandler("set-description", input, ctx, extra);
}

function setSystemChannel(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    const extra: Record<string, unknown> = {};
    if (typeof input.channelId === "string") extra.system_channel_id = input.channelId;
    return guildSettingsEnqueueHandler("set-system-channel", input, ctx, extra);
}

function setAfkChannel(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    const extra: Record<string, unknown> = {};
    if (typeof input.channelId === "string") extra.afk_channel_id = input.channelId;
    if (typeof input.afkTimeout === "number") extra.afk_timeout = input.afkTimeout;
    return guildSettingsEnqueueHandler("set-afk-channel", input, ctx, extra);
}

const setVerificationLevel = (input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> =>
    guildSettingsEnqueueHandler("set-verification-level", input, ctx, {
        verification_level: typeof input.verificationLevel === "number" ? input.verificationLevel : 0,
    });

function guildSettingsOp(input_schema: JSONSchema, handler: OperationSpec["handler"]): OperationSpec {
    return {
        safety_tier: "manual",
        input_schema,
        output_schema: ENQUEUE_RESULT_SCHEMA,
        side_effects: { writes_outbound: true, writes_audit: true },
        validation: { bot_permission: "ManageGuild" },
        result_classes: STRUCTURAL_RESULT_CLASSES,
        handler,
    };
}

export const GUILD_SETTINGS_OPS: Readonly<Record<string, OperationSpec>> = {
    "discord:guild-settings.set-name": guildSettingsOp(GUILD_NAME_INPUT, setName),
    "discord:guild-settings.set-icon": guildSettingsOp(GUILD_IMAGE_INPUT, setIcon),
    "discord:guild-settings.set-banner": guildSettingsOp(GUILD_IMAGE_INPUT, setBanner),
    "discord:guild-settings.set-description": guildSettingsOp(GUILD_DESCRIPTION_INPUT, setDescription),
    "discord:guild-settings.set-system-channel": guildSettingsOp(GUILD_CHANNEL_REF_INPUT, setSystemChannel),
    "discord:guild-settings.set-afk-channel": guildSettingsOp(GUILD_CHANNEL_REF_INPUT, setAfkChannel),
    "discord:guild-settings.set-verification-level": guildSettingsOp(GUILD_VERIFICATION_INPUT, setVerificationLevel),
};
