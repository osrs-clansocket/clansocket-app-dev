import { registerOperation } from "../../flows/registries/operation-registry.js";
import type { OperationContext, OperationResult } from "../../flows/registries/registry-types.js";
import type { FlowFieldList } from "../../flows/registries/payload-field-types.js";
import { STRUCTURAL_RESULT_CLASSES, TARGET_KIND_GUILD_SETTINGS, enqueue, readString } from "./manifest-shared.js";
import { FIELD_CHANNEL_OPTIONAL, FIELD_GUILD, FIELD_IMAGE_URL, FIELD_REASON } from "./manifest-field-primitives.js";

const QUEUE_OUTPUT: FlowFieldList = [{ name: "queueId", type: "string" }];

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

const setVerificationLevel = (
    input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
): Promise<OperationResult> =>
    guildSettingsEnqueueHandler("set-verification-level", input, ctx, {
        verification_level: typeof input.verificationLevel === "number" ? input.verificationLevel : 0,
    });

function gsOp(
    opId: string,
    inputFields: FlowFieldList,
    handler: (i: Readonly<Record<string, unknown>>, c: OperationContext) => Promise<OperationResult>,
): void {
    registerOperation({
        capability: "discord",
        opId,
        safety_tier: "manual",
        inputFields,
        outputFields: QUEUE_OUTPUT,
        result_classes: STRUCTURAL_RESULT_CLASSES,
        side_effects: { writes_outbound: true, writes_audit: true },
        validation: { bot_permission: "ManageGuild" },
        handler,
    });
}

gsOp(
    "discord:guild-settings.set-name",
    [FIELD_GUILD, { name: "name", type: "string", required: true, minLength: 2, maxLength: 100 }, FIELD_REASON],
    setName,
);
gsOp("discord:guild-settings.set-icon", [FIELD_GUILD, FIELD_IMAGE_URL, FIELD_REASON], setIcon);
gsOp("discord:guild-settings.set-banner", [FIELD_GUILD, FIELD_IMAGE_URL, FIELD_REASON], setBanner);
gsOp(
    "discord:guild-settings.set-description",
    [FIELD_GUILD, { name: "description", type: "string", maxLength: 300 }, FIELD_REASON],
    setDescription,
);
gsOp(
    "discord:guild-settings.set-system-channel",
    [FIELD_GUILD, FIELD_CHANNEL_OPTIONAL, FIELD_REASON],
    setSystemChannel,
);
gsOp(
    "discord:guild-settings.set-afk-channel",
    [
        FIELD_GUILD,
        FIELD_CHANNEL_OPTIONAL,
        { name: "afkTimeout", type: "integer", minimum: 60, maximum: 3600 },
        FIELD_REASON,
    ],
    setAfkChannel,
);
gsOp(
    "discord:guild-settings.set-verification-level",
    [
        FIELD_GUILD,
        {
            name: "verificationLevel",
            type: "verification-level",
            valueSourceRef: "discord-verification-level",
            required: true,
        },
        FIELD_REASON,
    ],
    setVerificationLevel,
);
