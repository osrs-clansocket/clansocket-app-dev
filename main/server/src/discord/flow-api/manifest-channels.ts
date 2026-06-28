import { registerOperation } from "../../flows/registries/operation-registry.js";
import type { OperationContext, OperationResult } from "../../flows/registries/registry-types.js";
import type { FlowFieldList } from "../../flows/registries/payload-field-types.js";
import { STRUCTURAL_RESULT_CLASSES, structuralEnqueueHandler } from "./manifest-shared.js";
import {
    FIELD_CHANNEL,
    FIELD_GUILD,
    FIELD_NAME_100,
    FIELD_PARENT_CHANNEL,
    FIELD_POSITION,
    FIELD_POSITION_OPTIONAL,
    FIELD_REASON,
    FIELD_TOPIC,
} from "./manifest-field-primitives.js";

const QUEUE_OUTPUT: FlowFieldList = [{ name: "queueId", type: "string" }];
const CHANNEL_BASE: FlowFieldList = [FIELD_GUILD, FIELD_CHANNEL];

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

function channelOp(opId: string, inputFields: FlowFieldList, handler: (i: Readonly<Record<string, unknown>>, c: OperationContext) => Promise<OperationResult>): void {
    registerOperation({
        capability: "discord",
        opId,
        safety_tier: "manual",
        inputFields,
        outputFields: QUEUE_OUTPUT,
        result_classes: STRUCTURAL_RESULT_CLASSES,
        side_effects: { writes_outbound: true, writes_audit: true },
        validation: { bot_permission: "ManageChannels" },
        handler,
    });
}

channelOp("discord:channels.update", [
    ...CHANNEL_BASE,
    { ...FIELD_NAME_100, required: false },
    FIELD_TOPIC,
    FIELD_PARENT_CHANNEL,
    FIELD_POSITION_OPTIONAL,
    FIELD_REASON,
], channelUpdate);

channelOp("discord:channels.delete", [...CHANNEL_BASE, FIELD_REASON], channelDelete);

channelOp("discord:channels.move", [...CHANNEL_BASE, FIELD_POSITION, FIELD_REASON], channelMove);
