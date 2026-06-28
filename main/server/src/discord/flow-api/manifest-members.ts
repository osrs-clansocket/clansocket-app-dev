import { registerOperation } from "../../flows/registries/operation-registry.js";
import type { OperationContext, OperationResult } from "../../flows/registries/registry-types.js";
import type { FlowFieldList } from "../../flows/registries/payload-field-types.js";
import { TARGET_KIND_MEMBER_MUTATION, enqueue, readString } from "./manifest-shared.js";
import { FIELD_GUILD, FIELD_REASON, FIELD_ROLE, FIELD_USER } from "./manifest-field-primitives.js";

import { MEMBER_RESULT_CLASSES } from "./result-classes.js";
const QUEUE_OUTPUT: FlowFieldList = [{ name: "queueId", type: "string" }];

const GUILD_USER: FlowFieldList = [FIELD_GUILD, FIELD_USER];
const MEMBER_ROLE_INPUT: FlowFieldList = [...GUILD_USER, FIELD_ROLE, FIELD_REASON];
const MEMBER_NICKNAME_INPUT: FlowFieldList = [...GUILD_USER, { name: "nickname", type: "string", maxLength: 32 }, FIELD_REASON];
const MEMBER_TIMEOUT_INPUT: FlowFieldList = [
    ...GUILD_USER,
    { name: "durationMs", type: "integer", required: true, minimum: 0, maximum: 2_419_200_000 },
    FIELD_REASON,
];
const MEMBER_KICK_INPUT: FlowFieldList = [...GUILD_USER, FIELD_REASON];
const MEMBER_BAN_INPUT: FlowFieldList = [
    ...GUILD_USER,
    FIELD_REASON,
    { name: "deleteMessageDays", type: "integer", minimum: 0, maximum: 7 },
];

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

function memberOp(opId: string, tier: "live" | "manual", inputFields: FlowFieldList, handler: (i: Readonly<Record<string, unknown>>, c: OperationContext) => Promise<OperationResult>, botPermission: string): void {
    registerOperation({
        capability: "discord",
        opId,
        safety_tier: tier,
        inputFields,
        outputFields: QUEUE_OUTPUT,
        result_classes: MEMBER_RESULT_CLASSES,
        side_effects: { writes_outbound: true, writes_audit: true },
        validation: { bot_permission: botPermission },
        handler,
    });
}

memberOp("discord:members.add-role", "live", MEMBER_ROLE_INPUT, addRole, "ManageRoles");
memberOp("discord:members.set-nickname", "live", MEMBER_NICKNAME_INPUT, setNickname, "ManageNicknames");
memberOp("discord:members.remove-role", "manual", MEMBER_ROLE_INPUT, removeRole, "ManageRoles");
memberOp("discord:members.timeout", "manual", MEMBER_TIMEOUT_INPUT, timeoutMember, "ModerateMembers");
memberOp("discord:members.kick", "manual", MEMBER_KICK_INPUT, kick, "KickMembers");
memberOp("discord:members.ban", "manual", MEMBER_BAN_INPUT, ban, "BanMembers");
memberOp("discord:members.unban", "manual", MEMBER_KICK_INPUT, unban, "BanMembers");
