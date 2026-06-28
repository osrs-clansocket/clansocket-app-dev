import { registerOperation } from "../../flows/registries/operation-registry.js";
import type { OperationContext, OperationResult } from "../../flows/registries/registry-types.js";
import type { FlowFieldList } from "../../flows/registries/payload-field-types.js";
import { STRUCTURAL_RESULT_CLASSES, readString, structuralEnqueueHandler } from "./manifest-shared.js";
import {
    FIELD_AVATAR_URL,
    FIELD_CHANNEL,
    FIELD_GUILD,
    FIELD_NAME_80,
    FIELD_REASON,
    FIELD_WEBHOOK,
} from "./manifest-field-primitives.js";

const QUEUE_OUTPUT: FlowFieldList = [{ name: "queueId", type: "string" }];

async function webhookCreate(
    input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
): Promise<OperationResult> {
    const extra: Record<string, unknown> = {
        name: readString(input, "name"),
        channel_id: readString(input, "channelId"),
    };
    if (typeof input.avatarUrl === "string") extra.avatar_url = input.avatarUrl;
    return structuralEnqueueHandler("webhook.create", "channelId", input, ctx, extra);
}

async function webhookDelete(
    input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
): Promise<OperationResult> {
    return structuralEnqueueHandler("webhook.delete", "webhookId", input, ctx, {});
}

function webhookOp(
    opId: string,
    tier: "live" | "manual",
    inputFields: FlowFieldList,
    handler: (i: Readonly<Record<string, unknown>>, c: OperationContext) => Promise<OperationResult>,
): void {
    registerOperation({
        capability: "discord",
        opId,
        safety_tier: tier,
        inputFields,
        outputFields: QUEUE_OUTPUT,
        result_classes: STRUCTURAL_RESULT_CLASSES,
        side_effects: { writes_outbound: true, writes_audit: true },
        validation: { bot_permission: "ManageWebhooks" },
        handler,
    });
}

webhookOp(
    "discord:webhooks.create",
    "live",
    [FIELD_GUILD, FIELD_CHANNEL, FIELD_NAME_80, FIELD_AVATAR_URL, FIELD_REASON],
    webhookCreate,
);
webhookOp("discord:webhooks.delete", "manual", [FIELD_GUILD, FIELD_WEBHOOK, FIELD_REASON], webhookDelete);
