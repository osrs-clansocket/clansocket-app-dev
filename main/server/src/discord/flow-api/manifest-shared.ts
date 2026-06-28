import { enqueueOutboundEvent } from "../../database/discord/outbound/enqueue.js";
import type { JSONSchema, OperationContext, OperationResult } from "../../flows/registries/registry-types.js";

export const CAPABILITY_NAME = "discord";
export const CAPABILITY_COLOR = "blurple";
export const TARGET_KIND_CHANNEL = "channel";
export const TARGET_KIND_CHANNEL_MESSAGE = "channel_message";
export const TARGET_KIND_DM = "dm";
export const TARGET_KIND_WEBHOOK_POST = "webhook_post";
export const TARGET_KIND_MEMBER_MUTATION = "member_mutation";
export const TARGET_KIND_STRUCTURAL_MUTATION = "structural_mutation";
export const TARGET_KIND_GUILD_SETTINGS = "guild_settings";

export const ENQUEUE_RESULT_SCHEMA: JSONSchema = {
    type: "object",
    required: ["queueId"],
    properties: { queueId: { type: "string" } },
};

export { STRUCTURAL_RESULT_CLASSES } from "./result-classes.js";

export function readString(input: Readonly<Record<string, unknown>>, key: string): string {
    const value = input[key];
    if (typeof value !== "string" || value.length === 0) {
        throw new Error(`discord operation: missing required string "${key}"`);
    }
    return value;
}

export function requireBotId(ctx: OperationContext): string {
    if (!ctx.botId) throw new Error("discord operation: ctx.botId required");
    return ctx.botId;
}

export interface EnqueueArgs {
    readonly targetKind: string;
    readonly targetId: string;
    readonly targetName: string | null;
    readonly payload: Readonly<Record<string, unknown>>;
}

export function enqueue(ctx: OperationContext, guildId: string, args: EnqueueArgs): string {
    return enqueueOutboundEvent({
        botId: requireBotId(ctx),
        guildId,
        clanId: ctx.clanId,
        targetKind: args.targetKind,
        targetId: args.targetId,
        targetName: args.targetName,
        payload: args.payload,
        flowIdOrigin: ctx.flowId,
        flowName: ctx.flowName,
        flowVersion: String(ctx.flowVersion),
    });
}

export async function structuralEnqueueHandler(
    action: string,
    targetIdKey: string,
    input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
    extra: Readonly<Record<string, unknown>>,
): Promise<OperationResult> {
    const guildId = readString(input, "guildId");
    const targetId = targetIdKey === "guildId" ? guildId : readString(input, targetIdKey);
    const payload: Record<string, unknown> = { structural_action: action, guild_id: guildId, ...extra };
    if (typeof input.reason === "string") payload.reason = input.reason;
    const queueId = enqueue(ctx, guildId, {
        targetKind: TARGET_KIND_STRUCTURAL_MUTATION,
        targetId,
        targetName: null,
        payload,
    });
    return { result_class: "queued", outputs: { queueId } };
}
