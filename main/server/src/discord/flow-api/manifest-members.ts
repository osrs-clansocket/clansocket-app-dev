import type {
    JSONSchema,
    OperationContext,
    OperationResult,
    OperationSpec,
} from "../../flows/registries/registry-types.js";
import { ENQUEUE_RESULT_SCHEMA, TARGET_KIND_MEMBER_MUTATION, enqueue, readString } from "./manifest-shared.js";

const MEMBER_RESULT_CLASSES: readonly string[] = ["queued", "permission_denied", "member_not_found", "guild_not_found"];

const MEMBER_ADD_ROLE_INPUT: JSONSchema = {
    type: "object",
    required: ["guildId", "userId", "roleId"],
    additionalProperties: false,
    properties: {
        guildId: { type: "string", format: "discord-guild-id" },
        userId: { type: "string", format: "discord-member-id" },
        roleId: { type: "string", format: "discord-role-id" },
        reason: { type: "string", maxLength: 512 },
    },
};

const MEMBER_NICKNAME_INPUT: JSONSchema = {
    type: "object",
    required: ["guildId", "userId"],
    additionalProperties: false,
    properties: {
        guildId: { type: "string", format: "discord-guild-id" },
        userId: { type: "string", format: "discord-member-id" },
        nickname: { type: "string", maxLength: 32 },
        reason: { type: "string", maxLength: 512 },
    },
};

const MEMBER_TIMEOUT_INPUT: JSONSchema = {
    type: "object",
    required: ["guildId", "userId", "durationMs"],
    additionalProperties: false,
    properties: {
        guildId: { type: "string", format: "discord-guild-id" },
        userId: { type: "string", format: "discord-member-id" },
        durationMs: { type: "integer", minimum: 0, maximum: 2_419_200_000 },
        reason: { type: "string", maxLength: 512 },
    },
};

const MEMBER_KICK_INPUT: JSONSchema = {
    type: "object",
    required: ["guildId", "userId"],
    additionalProperties: false,
    properties: {
        guildId: { type: "string", format: "discord-guild-id" },
        userId: { type: "string", format: "discord-member-id" },
        reason: { type: "string", maxLength: 512 },
    },
};

const MEMBER_BAN_INPUT: JSONSchema = {
    type: "object",
    required: ["guildId", "userId"],
    additionalProperties: false,
    properties: {
        guildId: { type: "string", format: "discord-guild-id" },
        userId: { type: "string", format: "discord-member-id" },
        reason: { type: "string", maxLength: 512 },
        deleteMessageDays: { type: "integer", minimum: 0, maximum: 7 },
    },
};

async function memberMutationEnqueueHandler(
    action: string,
    input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
    extra: Readonly<Record<string, unknown>>,
): Promise<OperationResult> {
    const guildId = readString(input, "guildId");
    const userId = readString(input, "userId");
    const payload: Record<string, unknown> = { member_action: action, guild_id: guildId, ...extra };
    if (typeof input.reason === "string") payload.reason = input.reason;
    const queueId = enqueue(ctx, guildId, {
        targetKind: TARGET_KIND_MEMBER_MUTATION,
        targetId: userId,
        targetName: null,
        payload,
    });
    return { result_class: "queued", outputs: { queueId } };
}

async function addRole(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    return memberMutationEnqueueHandler("add-role", input, ctx, { role_id: readString(input, "roleId") });
}

async function removeRole(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    return memberMutationEnqueueHandler("remove-role", input, ctx, { role_id: readString(input, "roleId") });
}

async function setNickname(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    const extra: Record<string, unknown> = {};
    if (typeof input.nickname === "string") extra.nickname = input.nickname;
    return memberMutationEnqueueHandler("set-nickname", input, ctx, extra);
}

async function timeoutMember(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    return memberMutationEnqueueHandler("timeout", input, ctx, { duration_ms: input.durationMs ?? 0 });
}

async function kick(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    return memberMutationEnqueueHandler("kick", input, ctx, {});
}

async function ban(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    const extra: Record<string, unknown> = {};
    if (typeof input.deleteMessageDays === "number") extra.delete_message_days = input.deleteMessageDays;
    return memberMutationEnqueueHandler("ban", input, ctx, extra);
}

async function unban(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    return memberMutationEnqueueHandler("unban", input, ctx, {});
}

function memberOp(
    safety_tier: "live" | "manual",
    input_schema: JSONSchema,
    handler: OperationSpec["handler"],
    botPermission: string,
): OperationSpec {
    return {
        safety_tier,
        input_schema,
        output_schema: ENQUEUE_RESULT_SCHEMA,
        side_effects: { writes_outbound: true, writes_audit: true },
        validation: { bot_permission: botPermission },
        result_classes: MEMBER_RESULT_CLASSES,
        handler,
    };
}

export const MEMBER_OPS: Readonly<Record<string, OperationSpec>> = {
    "discord:members.add-role": memberOp("live", MEMBER_ADD_ROLE_INPUT, addRole, "ManageRoles"),
    "discord:members.set-nickname": memberOp("live", MEMBER_NICKNAME_INPUT, setNickname, "ManageNicknames"),
    "discord:members.remove-role": memberOp("manual", MEMBER_ADD_ROLE_INPUT, removeRole, "ManageRoles"),
    "discord:members.timeout": memberOp("manual", MEMBER_TIMEOUT_INPUT, timeoutMember, "ModerateMembers"),
    "discord:members.kick": memberOp("manual", MEMBER_KICK_INPUT, kick, "KickMembers"),
    "discord:members.ban": memberOp("manual", MEMBER_BAN_INPUT, ban, "BanMembers"),
    "discord:members.unban": memberOp("manual", MEMBER_KICK_INPUT, unban, "BanMembers"),
};
